import { useState } from "react";
import { createPortal } from "react-dom";

const ConfirmationModal = ({ message, noButton, yesButton, onYes, onNo }) => {
  return createPortal(
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800/40">
      <div className="bg-amber-100 p-6 rounded-lg w-4/5 shadow-[-4px_4px_4px_#888888]"> 
        <p className="text-2xl font-bold mb-4 text-center">{message}</p>

        <div className="flex flex-row justify-center">        
          <button onClick={() => { onNo() } } className="font-bold rounded-lg text-2xl text-orange-400/70 p-3 bg-red-500 hover:bg-red-600 text-white m-4">
            {noButton}
          </button>
          <button onClick={() => { onYes() } } className="font-bold rounded-lg text-2xl text-orange-400/70 p-3 text-white bg-orange-400/70 hover:bg-orange-400/90 m-4">
            {yesButton}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmationModal;
