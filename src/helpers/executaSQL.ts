/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import oracledb, { BindParameters, ExecuteOptions, ResultSet } from 'oracledb';
import getDBConfig from '../config/database';
import mainEnv from '../main/MainEnv';

oracledb.fetchAsString = [oracledb.DATE, oracledb.CLOB, oracledb.NCLOB];
oracledb.fetchAsBuffer = [oracledb.BLOB];
oracledb.autoCommit = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let dbConfig = getDBConfig();

// Carrega instantClient do Assets
const setAppInstantClient = () => {
  if (dbConfig.appInstantClient) {
    let libPath;
    if (process.platform === 'win32') {
      libPath = mainEnv.oraClient;
    }
    if (libPath && fs.existsSync(libPath)) {
      try {
        oracledb.initOracleClient({ libDir: libPath });
      } catch (error: any) {
        console.log(error.message);
      }
    }
  }
};

// Recarrega os parametros, caso alterado
const reloadDBConfig = () => {
  if (mainEnv.reloadDBConfig) {
    dbConfig = getDBConfig();
    mainEnv.reloadDBConfig = false;
  }
};
//

setAppInstantClient();

// Transforma  resultados BLOB em Base64
function blobsToBase64<T extends Object>(
  rows: T[] | undefined,

  metaData: oracledb.Metadata<T>[] | undefined
) {
  if (metaData && rows && metaData.length > 0) {
    const blobsFields = metaData
      .map((data) => (data.dbTypeName === 'BLOB' ? data.name : false))
      .filter((f) => f);

    if (blobsFields) {
      rows.forEach((row: any) => {
        Object.keys(row).forEach((key) => {
          if (blobsFields.includes(key)) {
            // eslint-disable-next-line no-param-reassign
            row[key] = row[key].toString('base64');
          }
        });
      });
    }
  }

  return rows;
}

export default async function execSql<T extends Object>(
  statement: string,
  binds: BindParameters = [],
  options: ExecuteOptions = { extendedMetaData: true }
): Promise<oracledb.Result<T>> {
  reloadDBConfig();
  // console.log(oracledb.oracleClientVersion);

  let pool;
  let connection;
  let opt = null;

  try {
    pool = await oracledb.createPool(dbConfig);

    connection = await pool.getConnection();

    const stm = statement.toLowerCase();

    // Se houver algum parametro cursor já devolve o resultSet tratado
    if (stm.includes('begin') && stm.includes('end')) {
      if (stm.includes(':cursor')) {
        const opt = {
          cursor: {
            type: oracledb.CURSOR,

            dir: oracledb.BIND_OUT,
          },
        };

        const resulData = await connection.execute<{ cursor: ResultSet<T> }>(
          statement,
          { ...opt, ...binds },
          options
        );

        if (!resulData.outBinds || !('cursor' in resulData.outBinds)) throw new Error('Cursor não encontrado!');

        const resultSet = resulData.outBinds.cursor;

        const resultRows = await resultSet.getRows();

        await resultSet.close();

        return { ...resulData.outBinds.cursor, ...{ rows: resultRows } };
      }
    }

    const result = await connection.execute<T>(statement, binds, options);
    const rows = blobsToBase64<T>(result.rows, result.metaData);

    return { ...result, rows };


  } catch (err) {
    const e = err as Error;
    throw new Error(e.message.toString());
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log(err);
      }
    }
    if (pool) await pool.close();
  }
}

export async function ping(): Promise<string> {
  reloadDBConfig();

  let pool;

  try {
    pool = await oracledb.createPool(dbConfig);

    let connection;
    try {
      connection = await pool.getConnection();

      connection.ping();

      return 'online';
    } catch (err: any) {
      throw new Error(err.message.toString());
    } finally {
      if (connection) {
        try {
          await connection.close(); // Put the connection back in the pool
        } catch (err) {
          console.log(err);
        }
      }
    }
  } catch (err: any) {
    console.error(err.message);
    throw new Error(err.message.toString());
  } finally {
    if (pool) await pool.close();
  }
}
