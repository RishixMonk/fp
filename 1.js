import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ExcelDropZone = () => {
  const [parsedData, setParsedData] = useState([]);
  const [stoppageValue, setStoppageValue] = useState('0');

  const navigate = useNavigate();
  const[json,setJson] = useState()
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const stoppageTimeThreshold = parseFloat(stoppageValue); // Parse stoppageValue to float
      const points = [];
      for (let i = 0; i < json.length; i++) {
        const row = json[i];
        const latitude = parseFloat(row.latitude);
        const longitude = parseFloat(row.longitude);
        const odometer = parseFloat(row.odometer_reading);
        const speed = parseFloat(row.speed);
        const estimatedTime =  parseFloat(row.eventGeneratedTime)
        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(odometer) && !isNaN(speed)) {
          if (i > 0) {
          // console.log(latitude,longitude,odometer,speed);
            const prevOdometer = parseFloat(json[i - 1].odometer_reading);
            const prevSpeed = parseFloat(json[i - 1].speed);
            const prev_time = parseFloat(json[i - 1].eventGeneratedTime);
            // console.log(prevOdometer,prevSpeed,estimatedTime);
            if(speed-prevSpeed<=0) continue;
            const actualTime = (odometer - prevOdometer) / (speed - prevSpeed)+prev_time;
            const difference = estimatedTime - actualTime;
            // console.log(difference);
            if (difference > stoppageTimeThreshold) {
              points.push({
                latitude,
                longitude,
                stoppage: true
              });
            } else {
              console.log(1);
              points.push({
                latitude,
                longitude,
                stoppage: false
              });
            }
          }
        }
      }
      // console.log(points);
      setParsedData(points); // Store the parsed points in state
    };

    reader.readAsArrayBuffer(file);
  }, [stoppageValue]);

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
        <input
          type="number"
          placeholder="Stoppage Value"
          value={stoppageValue}
          onChange={(e) => setStoppageValue(e.target.value)}
          style={styles.inputBox}
        />
        <button type="button" className="btn btn-primary" onClick={handleAnalyseClick} disabled={parsedData.length === 0}>
          Analyse
        </button>
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
    marginLeft: '25%', // This leaves a 25% gap on the left
    marginTop: "2%"
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  }
};

export default ExcelDropZone;
