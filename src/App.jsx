/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-unused-state */
import React, { useState, useCallback, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Toolbar,
  MonthView,
  DayView,
  WeekView,
  ViewSwitcher,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  DragDropProvider,
  EditRecurrenceMenu,
  AllDayPanel,
} from "@devexpress/dx-react-scheduler-material-ui";
import { connectProps } from "@devexpress/dx-react-core";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import LocationOn from "@mui/icons-material/LocationOn";
import Notes from "@mui/icons-material/Notes";
import Close from "@mui/icons-material/Close";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Create from "@mui/icons-material/Create";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import db from "./database/firebase.config";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setMainAppointmentArray } from "./redux/actions";
import { connect } from "react-redux";
const PREFIX = "Demo";
// #FOLD_BLOCK
const classes = {
  content: `${PREFIX}-content`,
  header: `${PREFIX}-header`,
  closeButton: `${PREFIX}-closeButton`,
  buttonGroup: `${PREFIX}-buttonGroup`,
  button: `${PREFIX}-button`,
  picker: `${PREFIX}-picker`,
  wrapper: `${PREFIX}-wrapper`,
  icon: `${PREFIX}-icon`,
  textField: `${PREFIX}-textField`,
  addButton: `${PREFIX}-addButton`,
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
};

// #FOLD_BLOCK
const StyledDiv = styled("div")(({ theme }) => ({
  [`& .${classes.icon}`]: {
    margin: theme.spacing(2, 0),
    marginRight: theme.spacing(2),
  },
  [`& .${classes.header}`]: {
    overflow: "hidden",
    paddingTop: theme.spacing(0.5),
  },
  [`& .${classes.textField}`]: {
    width: "100%",
  },
  [`& .${classes.content}`]: {
    padding: theme.spacing(2),
    paddingTop: 0,
  },
  [`& .${classes.closeButton}`]: {
    float: "right",
  },
  [`& .${classes.picker}`]: {
    marginRight: theme.spacing(2),
    "&:last-child": {
      marginRight: 0,
    },
    width: "50%",
  },
  [`& .${classes.wrapper}`]: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
  },
  [`& .${classes.buttonGroup}`]: {
    display: "flex",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 2),
  },
  [`& .${classes.button}`]: {
    marginLeft: theme.spacing(2),
  },
  [`&.${classes.container}`]: {
    display: "flex",
    marginBottom: theme.spacing(2),
    justifyContent: "flex-end",
  },
  [`& .${classes.text}`]: {
    ...theme.typography.h6,
    marginRight: theme.spacing(2),
  },
}));
const StyledFab = styled(Fab)(({ theme }) => ({
  [`&.${classes.addButton}`]: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(4),
  },
}));
const AppointmentFormContainerBasic = ({
  visible,
  visibleChange,
  appointmentData,
  cancelAppointment,
  target,
  onHide,
  commitChanges,
}) => {
  const [appointmentChanges, setAppointmentChanges] = useState({
    id: null,
    title: "",
    location: "",
    notes: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  const [documentId, setDocumentId] = useState(null);

  const dispatch = useDispatch();

  const appointmentArrayValues = useSelector(
    (state) => state.name.mainAppointmentsArray
  );

  const getAppointmentData = () => appointmentData;

  const getAppointmentChanges = () => appointmentChanges;

  const changeAppointment = ({ field, changes }) => {
    setAppointmentChanges((prevChanges) => ({
      ...prevChanges,
      [field]: changes,
    }));
  };

  const commitAppointment = async (type) => {
    const appointment = {
      ...getAppointmentData(),
      ...getAppointmentChanges(),
    };
    if (type === "deleted") {
      commitChanges({ [type]: appointment.id });
      deleteAppointment(appointmentChanges.id);
    } else if (type === "changed") {
      commitChanges({ [type]: { [appointment.id]: appointment } });
      updateAppointment(appointmentChanges.id);
    } else if (type === "added") {
      commitChanges({ [type]: appointment });
      addAppointment();
    }
    setAppointmentChanges({
      id: null,
      title: "",
      location: "",
      notes: "",
      startDate: new Date(),
      endDate: new Date(),
    });
  };

  const getDocumentId = useCallback(() => {
    const lastId = appointmentArrayValues.map((doc) => doc.id);
    setDocumentId(lastId);
  }, [appointmentChanges]);

  useEffect(() => {
    if (documentId !== null) {
      console.log("Updated document IDs:", documentId);
    }
  }, [documentId]);

  const getMaxAppointmentId = useCallback(async () => {
    try {
      const appointmentRef = collection(db, "appointments");
      const querySnap = await getDocs(appointmentRef);

      let maxId = -1;
      querySnap.forEach((doc) => {
        const data = doc.data();
        const id = data.id;
        if (id > maxId) {
          maxId = id;
        }
      });
      return maxId;
    } catch (error) {
      console.error("Error getting max Id", error);
      return -1;
    }
  }, []);

  const deleteAppointment = async (documentId) => {
    try {
      await deleteDoc(doc(db, "appointments", documentId));
      console.log("Appointment was deleted successfully");
    } catch (error) {
      console.error("Error while deleting an appointment", error);
    }
  };

  const addAppointment = async () => {
    const { id, title, location, notes, startDate, endDate } =
      appointmentChanges;
    try {
      const maxId = await getMaxAppointmentId();
      const newId = maxId + 1;
      const appointmentRef = collection(db, "appointments");
      await addDoc(appointmentRef, {
        id: newId,
        title,
        location,
        notes,
        startDate,
        endDate,
      });
      console.log("Appointment added successfully");
    } catch (error) {
      console.error("Error adding new appointment", error);
    }
  };

  const updateAppointment = async (documentId) => {
    const { title, location, notes, startDate, endDate } = appointmentChanges;
    try {
      const appointmentRef = doc(db, "appointments", documentId);
      await updateDoc(appointmentRef, {
        title,
        location,
        notes,
        startDate,
        endDate,
      });
      console.log("Appointment updated successfully");
    } catch (error) {
      console.error("Error while updating appointment", error);
    }
  };

  useEffect(() => {
    if (appointmentData.id !== undefined) {
      setAppointmentChanges({
        ...appointmentChanges,
        ...appointmentData,
      });
    }
  }, [appointmentData]);

  const cancelChanges = () => {
    setAppointmentChanges({
      id: 0,
      title: "",
      location: "",
      notes: "",
      startDate: new Date(),
      endDate: new Date(),
    });
    visibleChange();
    cancelAppointment();
  };

  const displayAppointmentData = {
    ...appointmentData,
    ...appointmentChanges,
  };

  const isNewAppointment = appointmentData.id === undefined;

  const applyChanges = isNewAppointment
    ? () => {
        commitAppointment("added");
      }
    : () => commitAppointment("changed");

  const textEditorProps = (field) => ({
    variant: "outlined",
    onChange: ({ target: change }) =>
      changeAppointment({
        field: [field],
        changes: change.value,
      }),
    value: displayAppointmentData[field] || "",
    label: field[0].toUpperCase() + field.slice(1),
    className: classes.textField,
  });

  const pickerEditorProps = (field) => ({
    // keyboard: true,
    value: displayAppointmentData[field],
    onChange: (date) =>
      changeAppointment({
        field: [field],
        changes: date ? date.toDate() : new Date(displayAppointmentData[field]),
      }),
    ampm: false,
    inputFormat: "DD/MM/YYYY HH:mm",
    onError: () => null,
  });

  const startDatePickerProps = pickerEditorProps("startDate");
  const endDatePickerProps = pickerEditorProps("endDate");

  return (
    <>
      <AppointmentForm.Overlay
        visible={visible}
        target={target}
        fullSize
        onHide={onHide}
      >
        <StyledDiv
          onClick={() => {
            getDocumentId();
          }}
        >
          <div className={classes.header}>
            <IconButton
              className={classes.closeButton}
              onClick={cancelChanges}
              size="large"
            >
              <Close color="action" />
            </IconButton>
          </div>
          <div className={classes.content}>
            <p>DocumentId:{appointmentChanges.id}</p>
            <p>Title:{appointmentChanges.title}</p>
            <div className={classes.wrapper}>
              <Create className={classes.icon} color="action" />
              <TextField {...textEditorProps("title")} />
            </div>
            <div className={classes.wrapper}>
              <CalendarToday className={classes.icon} color="action" />
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  label="Start Date"
                  renderInput={(props) => (
                    <TextField className={classes.picker} {...props} />
                  )}
                  {...startDatePickerProps}
                />
                <DateTimePicker
                  label="End Date"
                  renderInput={(props) => (
                    <TextField className={classes.picker} {...props} />
                  )}
                  {...endDatePickerProps}
                />
              </LocalizationProvider>
            </div>
            <div className={classes.wrapper}>
              <LocationOn className={classes.icon} color="action" />
              <TextField {...textEditorProps("location")} />
            </div>
            <div className={classes.wrapper}>
              <Notes className={classes.icon} color="action" />
              <TextField {...textEditorProps("notes")} multiline rows="6" />
            </div>
          </div>
          <div className={classes.buttonGroup}>
            {!isNewAppointment && (
              <Button
                variant="outlined"
                color="secondary"
                className={classes.button}
                onClick={() => {
                  visibleChange();
                  commitAppointment("deleted");
                }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              className={classes.button}
              onClick={() => {
                visibleChange();
                applyChanges();
              }}
            >
              {isNewAppointment ? "Create" : "Save"}
            </Button>
          </div>
        </StyledDiv>
      </AppointmentForm.Overlay>
    </>
  );
};

const App = (props) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [editingFormVisible, setEditingFormVisible] = useState(false);
  const [deletedAppointmentId, setDeletedAppointmentId] = useState(undefined);
  const [editingAppointment, setEditingAppointment] = useState(undefined);
  const [previousAppointment, setPreviousAppointment] = useState(undefined);
  const [addedAppointment, setAddedAppointment] = useState({});
  const [startDayHour, setStartDayHour] = useState(0);
  const [endDayHour, setEndDayHour] = useState(24);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [documentId, setDocumentId] = useState(undefined);

  const appointmentArrayValues = useSelector(
    (state) => state.name.mainAppointmentsArray
  );

  const getAppointmentsFromFirestore = async () => {
    try {
      const docRef = collection(db, "appointments");
      const querySnap = await getDocs(docRef);

      const result = querySnap.docs.map((doc) => {
        const appointmentsData = doc.data();
        const parsedStartDate = appointmentsData.startDate.toDate();
        const parsedEndDate = appointmentsData.endDate.toDate();

        return {
          ...appointmentsData,
          id: doc.id,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        };
      });

      dispatch(setMainAppointmentArray(result));

      setData(result);
    } catch (error) {
      console.error("Error fetching appointments: ", error);
    }
  };

  useEffect(() => {
    getAppointmentsFromFirestore();
  }, [dispatch]);

  useEffect(() => {
    console.log("Appointments from Redux: ", appointmentArrayValues);
  }, [appointmentArrayValues]);

  const toggleConfirmationVisible = useCallback(() => {
    setConfirmationVisible((prev) => !prev);
  }, []);

  const toggleEditingFormVisibility = useCallback(() => {
    setEditingFormVisible((prev) => !prev);
  }, []);

  const onEditingAppointmentChange = useCallback((editingAppointment) => {
    setEditingAppointment(editingAppointment);
  }, []);

  const onAddedAppointmentChange = useCallback(
    (addedAppointment) => {
      setAddedAppointment(addedAppointment);
      if (editingAppointment !== undefined) {
        setPreviousAppointment(editingAppointment);
      }
      setEditingAppointment(undefined);
      setIsNewAppointment(true);
    },
    [editingAppointment]
  );

  const commitDeletedAppointment = useCallback(() => {
    setData((data) =>
      data.filter((appointment) => appointment.id !== deletedAppointmentId)
    );
    toggleConfirmationVisible();
    setDeletedAppointmentId(null);
  }, [deletedAppointmentId, toggleConfirmationVisible]);

  const commitChanges = useCallback(
    ({ added, changed, deleted }) => {
      setData((data) => {
        let updatedData = [...data];
        if (added) {
          const startingAddedId =
            data.length > 0 ? data[data.length - 1].id + 1 : 0;
          updatedData = [...updatedData, { id: startingAddedId, ...added }];
        }
        if (changed) {
          updatedData = updatedData.map((appointment) =>
            changed[appointment.id]
              ? { ...appointment, ...changed[appointment.id] }
              : appointment
          );
        }
        if (deleted !== undefined) {
          setDeletedAppointmentId(deleted);
          toggleConfirmationVisible();
        }
        return updatedData;
      });
      setAddedAppointment({});
    },
    [toggleConfirmationVisible]
  );

  const cancelAppointment = useCallback(() => {
    if (isNewAppointment) {
      setEditingAppointment(previousAppointment);
      setIsNewAppointment(false);
    }
  }, [isNewAppointment, previousAppointment]);

  const appointmentForm = connectProps(AppointmentFormContainerBasic, () => {
    const currentAppointment =
      data.filter(
        (appointment) =>
          editingAppointment && appointment.id === editingAppointment.id
      )[0] || addedAppointment;

    return {
      visible: editingFormVisible,
      appointmentData: currentAppointment,
      commitChanges: commitChanges,
      visibleChange: toggleEditingFormVisibility,
      onEditingAppointmentChange: onEditingAppointmentChange,
      cancelAppointment,
    };
  });

  useEffect(() => {
    appointmentForm.update();
  }, [appointmentForm]);

  const allDayLocalizationMessages = {
    "pl-PL": {
      allDay: "Cały dzień",
    },
    "en-US": {
      allDay: "All Day",
    },
  };

  const getAllDayMessages = (locale) => allDayLocalizationMessages[locale];

  const LocaleSwitcher = ({ onLocaleChange, currentLocale }) => (
    <StyledDiv className={classes.container}>
      <div className={classes.text}>Locale:</div>
      <TextField
        select
        variant="standard"
        value={currentLocale}
        onChange={onLocaleChange}
      >
        <MenuItem value="pl-PL">Polski (Polska)</MenuItem>
        <MenuItem value="en-US">English (United States)</MenuItem>
      </TextField>
    </StyledDiv>
  );

  const [locale, setLocale] = useState("en-US");

  const changedByUser = (event) => {
    setLocale(event.target.value);
  };

  return (
    <div>
      <LocaleSwitcher currentLocale={locale} onLocaleChange={changedByUser} />
      <Paper>
        <Scheduler data={data} height={660} locale={locale}>
          <ViewState currentDate={currentDate} />
          <EditingState
            onCommitChanges={commitChanges}
            onEditingAppointmentChange={onEditingAppointmentChange}
            onAddedAppointmentChange={onAddedAppointmentChange}
          />
          <DayView
            startDayHour={startDayHour}
            endDayHour={endDayHour}
            displayName="Dzień"
          />
          <WeekView
            startDayHour={startDayHour}
            endDayHour={endDayHour}
            displayName="Tydzień"
          />
          <MonthView displayName="Miesiąc" />
          <AllDayPanel messages={getAllDayMessages(locale)} />
          <EditRecurrenceMenu />
          <Appointments />
          <AppointmentTooltip showOpenButton showCloseButton showDeleteButton />
          <Toolbar />
          <ViewSwitcher />
          <AppointmentForm
            overlayComponent={appointmentForm}
            visible={editingFormVisible}
            onVisibilityChange={toggleEditingFormVisibility}
          />
          <DragDropProvider />
        </Scheduler>

        {/* Okno modalne */}
        <Dialog open={confirmationVisible} onClose={toggleConfirmationVisible}>
          <DialogTitle>Usuwanie Spotkania</DialogTitle>
          <DialogContent>
            <DialogContentText>Chcesz usunąć to spotkanie?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={toggleConfirmationVisible}
              color="primary"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={commitDeletedAppointment}
              color="secondary"
              variant="outlined"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <StyledFab
          color="secondary"
          className={classes.addButton}
          onClick={() => {
            setEditingFormVisible(true);
            onEditingAppointmentChange(undefined);
            onAddedAppointmentChange({
              startDate: new Date(currentDate).setHours(startDayHour),
              endDate: new Date(currentDate).setHours(startDayHour + 1),
            });
          }}
        >
          <AddIcon />
        </StyledFab>
      </Paper>
    </div>
  );
};

export default App;
