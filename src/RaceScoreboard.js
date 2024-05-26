import 'react-data-grid/lib/styles.css';
import DataGrid, {textEditor} from "react-data-grid";
import {useEffect, useState} from "react";

export default function RaceScoreboard() {
  const newRow = () => ({key: Date.now(), name: '', team: ''});
  const [rows, setRows] = useState([newRow()]);
  const [state, setState] = useState('data-entry');
  const [currentTime, setCurrentTime] = useState(0);
  const [stopTime, setStopTime] = useState(0);
  const [raceName, setRaceName] = useState('');

  useEffect(() => {
    if (state === 'ready') {
      setCurrentTime(0.00001);
      setStopTime(999);
    } else if (state === 'running') {
      setStopTime(rows.sort((rowA, rowB) => rowB.seconds - rowA.seconds)[0].seconds);
      const startTime = Date.now();
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

  const finisherRow = (row, spotsFromBottom, allFinishers) => (
      <div
          key={row.key}
          className={`finisher rounded-md border border-black bg-red p-2 ${(allFinishers.length - spotsFromBottom) % 2 ? 'even' : 'odd'}`}
          style={{
            top: `calc(100vh - ${40 * (spotsFromBottom + 3)}px)`
          }}
      >
        <div className="place">{allFinishers.length - spotsFromBottom}.</div>
        <div className="name">{row.name}</div>
        <div className="team">{row.team}</div>
        <div className="time">{displayTime(row.seconds)}</div>
      </div>
  )

  const columns = [
    {
      key: 'name',
      name: 'Runner Name',
      width: 300,
      resizable: true,
      renderEditCell: textEditor
    },
    {
      key: 'team',
      name: 'School/team',
      width: 250,
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
              rows={rows.sort((rowA, rowB) => rowA.seconds - rowB.seconds)}
              rowKeyGetter={(row => row.key)}
              rowHeight={30}
              onRowsChange={onRowsChange}

          />
          <input
              value={raceName}
              className="mr-3 w-80"
              placeholder="Race name"
              onChange={(e) => setRaceName(e.target.value)}
          />
          <button
            onClick={() => setState('ready')}
          >Ready...</button>
        </>
    )
  } else if (state === 'running' || state === 'ready') {
    return (
        <>
          <div id="running" style={{backgroundColor: '#00FF00'}}>
            <div
                className="live-time p-2 rounded-md"
                style={{position: "relative",
                        top: "calc(100vh - 80px)"
                      }}
            >
              {raceName}
              <span className={`ml-2 text-right float-right ${(currentTime >= stopTime) && 'hidden'}`}>
                {displayTime(currentTime >= 0.0 ? currentTime : 0.0001)}
              </span>
            </div>
            {
              rows
                  .filter((row) => currentTime >= row.seconds)
                  .sort((rowA, rowB) => rowB.seconds - rowA.seconds)
                  .map(finisherRow)
            }
          </div>
          <button
              onClick={() => setState('running')}
          >Go!</button>
          <button
            onClick={() => setState('data-entry')}
          >Back</button>
        </>
    )
  }

}
