import React, {useEffect, useState } from "react"
import {CgSpinnerTwo} from "react-icons/cg"


export const Alert = ({ background, text, children }) => {
  return (
    <div className={`p-2 flex flex-row rounded ${background} ${text} w-full`} role="alert">
      {children}
    </div>
  );
};

export const HelpAlert = ({ children, helpLink }) => {
  return (
    <Alert background="bg-slate-100" text="text-slate-800">
        <div className="flex flex-row justify-end">
            <div>{children}</div>
        </div>      
    </Alert>
  );
};

export const Modal = ({ show, children }) => {
  return (
    <div
      className={`modal ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

export const Badge = ({ variant, children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};

export const Spinner = () => {
  return (
    <>
    <div className="inline-block w-9 h-9 border-2 rounded-full" role="status">
        <CgSpinnerTwo className="w-8 h-8 animate-spin text-yellow-400"/>
    </div>
    </>
  )
};

