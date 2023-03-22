import { IAction, IGlobalState } from 'types/IGlobalState';

export default function reducer(
  state: IGlobalState,
  action: IAction | IAction[]
): IGlobalState {
  const arrAction: IAction[] = Array.isArray(action) ? action : [action];
  let newAction = { ...state };

  arrAction.forEach((act) => {
    if (Object.keys(state).includes(act.type) && typeof act.payload === typeof state[act.type]) {
      newAction = { ...newAction, [act.type]: act.payload };
      localStorage.setItem(act.type, act.payload);
    }
  });

  // console.log(action);

  return { ...newAction };
}
