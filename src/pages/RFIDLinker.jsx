import { useNavigate, useLocation } from "react-router-dom";

import { useState, useEffect, useRef } from 'react'

import Button from '../components/Button.jsx';
import LoadingModal from "../components/LoadingModal";
import DialogModal from "../components/DialogModal";
import ErrorDialogModal from "../components/ErrorDialogModal";

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL, import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const RFIDLinker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.rfid) {
    navigate("/")
  }

  const [clockIn, setClockIn] = useState(true)
  const [studentId, setStudentId] = useState("");
  const [loadingModal, setLoadingModal] = useState(null);
  const [errorLog, setErrorLog] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  const changeStudentId = (e) => {
    const { name, value } = e.target;
    setStudentId(value);
  }

  const recordRfid = async (e) => {
    const attendanceType = clockIn ? "IN" : "OUT";

    e.preventDefault();

    setLoadingModal("Linking your ID...");

    const { data, error } = await supabase
      .from('Students')
      .select("student_id, name")
      .eq("student_id", studentId)

    if (error) {
      setErrorLog(error["code"] + " - " + error["message"]);
      setLoadingModal(null);
      return;
    }
    if (data.length == 0) {
      setErrorLog(`Student with ID "${studentId}" not found.\r\nPlease manually record your attendance instead.`);
      setLoadingModal(null);
      return;
    }

    const response = await supabase
      .from('RfidToStudent')
      .upsert({ student_id: studentId, rfid: location.state?.rfid });
    let error2 = response["error"]

    setLoadingModal(null);

    if (error2) {
      setErrorLog(error2["code"] + " - " + error2["message"]);
    } else {
      setSuccessModal(true);
    }
  }

  return (
    <>
      <form className="flex flex-col h-screen" onSubmit={recordRfid}>
        <div className="m-auto">
          {/*
          <div className="w-5/8 m-auto">
            <img src={intramuralsWordmark} alt="Siklaban 2025 Wordmark" className="pt-10 pb-5" />
          </div>
          */}
          <div className="flex flex-row justify-center">
          	<h1 className="text-yellow-300 text-4xl">RFID Linker</h1>
          </div>
          <div className="flex flex-row justify-center">
            <p className="text-white text-xl pt-4">Your ID is current not linked to any student information.<br/>Please link it immediately to proceed.</p>
          </div>
          <div className="p-10">
            <label className="block text-sm font-medium text-gray-100">RFID</label>
            <input
                type='text'
                name='rfid'
                className="mt-1 block w-full p-2 border border-zinc-800 bg-zinc-400 rounded-md"
                value={location.state?.rfid}
                readOnly
            />
            <label className="block text-sm font-medium text-gray-100 pt-4">Student ID</label>
            <input
                type='text'
                name='studentId'
                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
                value={studentId}
                onChange={changeStudentId}
                required
            />
            <div className="flex flex-row justify-center pt-5">
              <Button type="button" onClick={() => { navigate("/") }} selected={true}>Go Back</Button>
              <div className="flex-grow"></div>
              <Button type="submit" selected={true}>Link My RFID</Button>
            </div>
          </div>
        </div>
      </form>
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
              message='RFID recorded. You can now try to tap in your ID.' 
              onClick={() => {setSuccessModal(false); navigate("/")} }
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

export default RFIDLinker
