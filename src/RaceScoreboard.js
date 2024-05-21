import 'react-data-grid/lib/styles.css';
import DataGrid, {textEditor} from "react-data-grid";
import {useEffect, useState} from "react";

export default function RaceScoreboard() {
  const newRow = () => ({key: Date.now(), name: ''});
  const [rows, setRows] = useState([newRow()]);
  const [state, setState] = useState('data-entry');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (state === 'running') {
      const startTime = Date.now() + 3000;
      const interval = setInterval(() => setCurrentTime((Date.now() - startTime) / 1000), 10);
      return () => clearInterval(interval);
    }
  }, [state]);

  const onRowsChange = (newRowData) => {
    const newRows = [...newRowData];
    if (!newRows.some(r => !r.name)) {
      newRows.push(newRow());
    }
    setRows(newRows);
  }
  const displayTime = (seconds) => (seconds && `${
          Math.floor(seconds / 60) || ''
      }${Math.floor(seconds / 60) ? ':' : ''}${
          Math.floor(seconds % 60).toString().padStart(2, '0')
      }.${Math.min(Math.round(100 * (seconds - Math.floor(seconds))), 99).toString().padStart(2, '0')}`)
      || '';
  const columns = [
    {
      key: 'name',
      name: 'Runner Name',
      width: 300,
      resizable: true,
      renderEditCell: textEditor
    },
    {
      key: 'seconds',
      name: 'Time in seconds',
      width: 150,
      resizable: true,
      renderEditCell: textEditor,
    },
    {
      key: 'display',
      name: 'Display',
      width: 150,
      renderCell: ({row}) => displayTime(row.seconds)
    },
    {
      key: 'remove',
      name: 'Remove',
      renderCell: ({row, rowIdx}) => (
          row.name &&
          <a
              style={{cursor: 'pointer', margin: "2em"}}
              onClick={() => {
                const newRows = [...rows];
                newRows.splice(rowIdx, 1);
                setRows(newRows);
              }}>X</a>
      )
    },
  ];

  if (state === 'data-entry') {
    return (
        <>
          <DataGrid
              columns={columns}
              rows={rows}
              rowKeyGetter={(row => row.key)}
              rowHeight={30}
              onRowsChange={onRowsChange}

          />
          <button
            onClick={() => setState('running')}
          >Start!</button>
        </>
    )
  } else if (state === 'running') {
    return (
        <>
          <div id="running" style={{backgroundColor: '#00FF00'}}>
            <div
                className="live-time p-2 rounded-md"
                style={{position: "relative",
                        top: "calc(100vh - 80px)"
                      }}
            >
              {displayTime(currentTime >= 0.0 ? currentTime : 0.0001)}
            </div>

          </div>
          <button
            onClick={() => setState('data-entry')}
          >Stop!</button>
        </>
    )
  }

}
