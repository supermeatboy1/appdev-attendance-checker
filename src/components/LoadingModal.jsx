import { useState } from "react";
import { createPortal } from "react-dom";

import loadingGif from '../assets/loading.gif';

const LoadingModal = ({ message }) => {
  return createPortal(
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800/40">
      <div className="bg-amber-100 p-6 rounded-lg w-1/2 shadow-[-4px_4px_4px_#888888]"> 
        <p className="text-2xl font-bold mt-4 text-center">{message}</p>

        <img src={loadingGif} alt="Loading GIF" className="w-1/2 mx-auto p-16" />
      </div>
    </div>,
    document.body
  );
}

export default LoadingModal;
