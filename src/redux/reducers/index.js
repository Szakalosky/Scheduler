const initialState = {
  mainAppointmentsArray: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_MAIN_APPOINTMENTS_ARRAY":
      return {
        ...state,
        mainAppointmentsArray: action.payload,
      };
    default:
      return state;
  }
};

export default rootReducer;
