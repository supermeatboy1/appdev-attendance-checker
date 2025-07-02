import { useNavigate } from "react-router-dom";

import { useState, useEffect, useRef } from 'react'

import Button from '../components/Button.jsx';
import LoadingModal from "../components/LoadingModal";
import DialogModal from "../components/DialogModal";
import ErrorDialogModal from "../components/ErrorDialogModal";

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const ManualAttendance = () => {
  const navigate = useNavigate();

  const [clockIn, setClockIn] = useState(true)
  const [formData, setFormData] = useState({"studentId": "", "studentName": "", "year": 1, "type": "IN"})
  const [loadingModal, setLoadingModal] = useState(null);
  const [errorLog, setErrorLog] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  const changeForm = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  const recordAttendance = async (e) => {
    const attendanceType = clockIn ? "IN" : "OUT";

    e.preventDefault();
    console.log(formData);

    setLoadingModal("Recording manual attendance...");

    const { error } = await supabase
      .from('ManualAttendance')
      .insert({ student_id: formData["studentId"], type: attendanceType,
                name: formData["studentName"], year: formData["year"] });

    setLoadingModal(null);

    if (error) {
      setErrorLog(error["code"] + " - " + error["message"]);
    } else {
      setSuccessModal(true);
    }
  }

  return (
    <>
      <form className="flex flex-col h-screen" onSubmit={recordAttendance}>
        <div className="m-auto">
          {/*
          <div className="w-5/8 m-auto">
            <img src={intramuralsWordmark} alt="Siklaban 2025 Wordmark" className="pt-10 pb-5" />
          </div>
          */}
          <div className="flex flex-row justify-center">
          	<h1 className="text-yellow-300 text-4xl">Manual Attendance</h1>
          </div>
          <div className="flex flex-row justify-start px-10 pt-4">
            <Button type="button" onClick={() => { navigate("/") }} selected={true}>Go Back</Button>
          </div>
          <div className="p-10">
            <label className="block text-sm font-medium text-gray-100">Student Name</label>
            <input
                type='text'
                name='studentName'
                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
                value={formData["studentName"]}
                onChange={changeForm}
                required
            />
            <label className="block text-sm font-medium text-gray-100 pt-4">Student ID</label>
            <input
                type='text'
                name='studentId'
                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
                value={formData["studentId"]}
                onChange={changeForm}
                required
            />
            <label className="block text-sm font-medium text-gray-100 pt-4">Year (1 / 2 / 3 / 4)</label>
            <input
                type='number'
                name='year'
                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
                value={formData["year"]}
                onChange={changeForm}
                required
            />
            <label className="block text-sm font-medium text-gray-100 py-4">Attendance Type</label>
            <div className="flex flex-row justify-start">
              <Button type="button" onClick={() => { setClockIn(true) }} selected={clockIn}>IN</Button>
              <Button type="button" onClick={() => { setClockIn(false) }} selected={!clockIn}>OUT</Button>
              <div className="flex-grow"></div> 
              <Button type="submit" selected={true}>Record Attendance</Button>
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

export default ManualAttendance
