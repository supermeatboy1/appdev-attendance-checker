import { useNavigate } from "react-router-dom";

import { useState, useEffect, useRef } from 'react'

import Button from '../components/Button.jsx';
import ConfirmationModal from "../components/ConfirmationModal";
import ErrorDialogModal from "../components/ErrorDialogModal";
import LoadingModal from "../components/LoadingModal";
import DialogModal from "../components/DialogModal";

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)

const Index = () => {
  const navigate = useNavigate();

  const [clockIn, setClockIn] = useState(true)
  const [useRFID, setUseRFID] = useState(true)
  const [idInput, setIdInput] = useState("")
  const [lastInputTime, setLastInputTime] = useState(Date.now())
  const [errorLog, setErrorLog] = useState(null);
  const [idConfirm, setIdConfirm] = useState(null);
  const [idConfirmModal, setIdConfirmModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [foundStudent, setFoundStudent] = useState("[ERROR]");
  const idInputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (useRFID && document.activeElement != idInputRef.current && !idConfirmModal) {
        console.log("Bringing back the focus...")
        idInputRef.current?.focus();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [useRFID, idConfirm, idInputRef])

  const fetchStudent = async (isRFID, currentInput) => {
    if (currentInput === undefined || currentInput === null || currentInput === "") {
      setLoadingModal(null);
      return;
    }

    console.log(`isRFID: ${isRFID}, currentInput: ${currentInput}`)

    if (!isRFID) {
      const { data, error } = await supabase
        .from('StudentsWithCluster')
        .select("student_id, name, cluster_name")
        .eq("student_id", currentInput)

      setLoadingModal(null);
      if (error) {
        setErrorLog(error["code"] + " - " + error["message"]);
        return;
      }
      if (data.length == 0) {
        setErrorLog(`Student with ID "${currentInput}" not found.`);
        return;
      } else {
        setIdConfirm(data[0]);
        setIdConfirmModal(true);

        console.log(data[0]);
      }
    } else {
      const { data, error } = await supabase
        .from('RfidToStudent')
        .select("student_id, rfid")
        .eq("rfid", currentInput)

      setLoadingModal(null);
      if (error) {
        setErrorLog(error["code"] + " - " + error["message"]);
        return;
      }
      if (data.length == 0) {
        navigate("/rfid_link", { state: {"rfid": currentInput} });
      } else {
        fetchStudent(false, data[0]["student_id"]);
      }
    }
  }

  const recordAttendance = async (studentId) => {
    const attendanceType = clockIn ? "IN" : "OUT";
    console.log(`Recording ${attendanceType} attendance for ${studentId}`);

    setIdConfirm(null);
    setIdConfirmModal(false);

    setLoadingModal("Recording attendance...");

    const { error } = await supabase
      .from('Attendance')
      .insert({ student_id: studentId, attendance_type: attendanceType });

    setLoadingModal(null);

    if (error) {
      setErrorLog(error);
    } else {
      setSuccessModal(true);
    }
  }

  const submitInput = async () => {
    console.log("Current input: " + idInput);
    const currentIdInput = idInput;

    setLoadingModal("Looking for student information...");
    fetchStudent(useRFID, currentIdInput);
    setIdInput("");
  } 

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="m-auto">
          {/*
          <div className="w-5/8 m-auto">
            <img src={intramuralsWordmark} alt="Siklaban 2025 Wordmark" className="pt-10 pb-5" />
          </div>
           */}
          <div className="flex flex-row justify-center pb-16">
            <h1 className="text-yellow-300 text-4xl">Attendance Checker</h1>
          </div>
          <div className="flex flex-row justify-center">
            <Button type="button" onClick={() => { setUseRFID(true); setIdInput("") }} selected={useRFID}>Use RFID</Button>
            <Button type="button" onClick={() => { setUseRFID(false); setIdInput("") }} selected={!useRFID}>Use Student ID</Button>
            <Button type="button" onClick={() => { navigate("/manual_attendance") }}>Manual Attendance</Button>
          </div>
          <div className="p-10">
            <label className="block text-sm font-medium text-gray-100">{useRFID ? "RFID Input" : "Student ID Input"}</label>
            <input
                ref={idInputRef}
                type='text'
                name='idInput'
                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
                value={idInput}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setIdInput(value);
                }}
                onKeyDown={(e) => {
                  if (e.key == 'Enter') {
                    submitInput();
                  } else if (useRFID) {
                    const diff = Date.now() - lastInputTime;
                    setLastInputTime(Date.now());
                    if (diff > 250) {
                      setIdInput("");
                    }
                  }
                }}
            />
            <div className="pt-4">
              <label className="text-sm font-medium text-gray-100 self-center">Attendance Type</label>
            </div>
            <div className="flex flex-row pt-4">
              <Button type="button" onClick={() => { setClockIn(true) }} selected={clockIn}>IN</Button>
              <Button type="button" onClick={() => { setClockIn(false) }} selected={!clockIn}>OUT</Button>
              <div className="flex-grow"></div>
              <Button type="button" onClick={submitInput} selected={true}>Record Attendance</Button>
            </div>
          </div>
        </div>
      </div>
        {(idConfirm != null && idConfirmModal) && (
            <ConfirmationModal
                noButton='No'
                yesButton='Yes'
                message={'Are you ' + idConfirm["name"] + " from the cluster " + idConfirm["cluster_name"] + "?"}
                onYes={() => {setIdConfirmModal(false); recordAttendance(idConfirm["student_id"]) } }
                onNo={() => {setIdConfirmModal(false); setIdConfirm(null);} }
            />
        )}
        {errorLog != null && (
            <ErrorDialogModal
                buttonText='Ok'
                message='An error occured. Please check the error message below.' 
                errorLog={errorLog}
                onClick={() => setErrorLog(null) }
            />
        )}
        {successModal && (
            <DialogModal
                buttonText='Ok'
                message='Attendance recorded.' 
                onClick={() => setSuccessModal(false) }
            />
        )}
        {loadingModal != null && (
            <LoadingModal
                message={loadingModal}
            />
        )}
    </>
  )
}

export default Index
