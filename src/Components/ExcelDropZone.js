import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';

const ExcelDropZone = () => {
  const [parsedData, setParsedData] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [stoppageValue, setStoppageValue] = useState('0');
  const [jsonData, setJsonData] = useState(null); // Initialize jsonData state
  const [first, setFirst] = useState(1); // Initialize jsonData state
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
      setJsonData(json); // Store JSON data in state
      setFileUploaded(true);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx, .xls' });

  const handleAnalyseClick = () => {
    if (!jsonData) {
      alert('Please upload a file.'); 
            return;
    }

    const stoppageTimeThreshold = parseFloat(stoppageValue);
    const points = [];
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const latitude = parseFloat(row.latitude);
      const longitude = parseFloat(row.longitude);
      const odometer = parseFloat(row['odometer reading']);
      const speed = parseFloat(row.speed);
      const estimatedTime = parseFloat(row.eventGeneratedTime);
      if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(odometer) && !isNaN(speed)) {
        if (i > 0) {
          const prevOdometer = parseFloat(jsonData[i - 1]['odometer reading']);
          const prevSpeed = parseFloat(jsonData[i - 1].speed);
          const prev_time = parseFloat(jsonData[i - 1].eventGeneratedTime);
          if (speed - prevSpeed <= 0) continue;
          const actualTime = (odometer - prevOdometer) / (speed - prevSpeed) + prev_time;
          const difference = estimatedTime - actualTime;
          console.log(estimatedTime,actualTime,actualTime-prev_time,prev_time)
          if (difference > stoppageTimeThreshold) {
            console.log(12);

            points.push({
              latitude,
              longitude,
              stoppage: true
            });
          } else {
            points.push({
              latitude,
              longitude,
              stoppage: false
            });
          }
        }
      }
    }
    setParsedData(points);
    if(first) {setFirst(0);return;}
    navigate('/scatter-plot', { state: { data: points } });
  };


  return (
    <>
      <div {...getRootProps()} style={styles.dropZone}>
        <input {...getInputProps()}  />
        {fileUploaded ? (
        <p>File uploaded</p>
      ) : (
        
        <p>Drag 'n' drop an Excel file here, or click to select a file</p>
      )}
      </div>
      <div  style={styles.buttonContainer}>
        <input
          type="number"
          placeholder="Stoppage Value"
          // value={stoppageValue}
          onChange={(e) => setStoppageValue(e.target.value)}
          onClick={handleAnalyseClick}
          style={styles.inputBox}
        />
        <button type="button" className="btn btn-outline-primary" onClick={handleAnalyseClick} disabled={parsedData.length === 0}>
          Analyse
        </button>
        <br/>
      </div>
      <div>
        <br/>
        <p style={{ textAlign: 'center', color: 'Black' ,backgroundColor:d3.rgb(0, 0, 0, 0)}}>Add High Stoppage Values like greater than 5000 to actually differentiate for smaller ranges of data.</p>
      </div>
    </>
  );
};

const styles = {
  dropZone: {
    width: '50%',
    height: '200px',
    borderWidth: '2px',
    borderColor: '#666',
    borderStyle: 'dashed',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
    marginLeft: '25%', 
    marginTop: '2%'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  }
};

export default ExcelDropZone;
