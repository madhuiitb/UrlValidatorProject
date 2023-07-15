import React from 'react'
import '../index.css'

export default function InputBox({ id, name, value, type, label, onChange }) {
  return (
    <div className='input-div'>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e)}
        placeholder=''
      />
      <span className='input-bottom'></span>
      <span className='bar'></span>
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
