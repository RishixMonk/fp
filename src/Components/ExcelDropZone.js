import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ExcelDropZone = () => {
  const [parsedData, setParsedData] = useState([]);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setParsedData(json); // Store the parsed data in state
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx, .xls' });

  const handleAnalyseClick = () => {
    navigate('/scatter-plot', { state: { data: parsedData } });
  };

  return (
    <>
      <div {...getRootProps()} style={styles.dropZone}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop an Excel file here, or click to select a file</p>
      </div>
      <div style={styles.buttonContainer}>
        <button type="button" className="btn btn-primary" onClick={handleAnalyseClick} disabled={parsedData.length === 0}>
          Analyse
        </button>
      </div>
    </>
  );
};

const styles = {
  dropZone: {
    width: '100%',
    height: '200px',
    borderWidth: '2px',
    borderColor: '#666',
    borderStyle: 'dashed',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  }
};

export default ExcelDropZone;
