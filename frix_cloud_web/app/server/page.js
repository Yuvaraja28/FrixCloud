'use client';
import { styles } from './styles.scss'
import useWebSocket from "react-use-websocket";
import { useState, useRef } from 'react';
import { Quicksand, Prompt, Lexend, Roboto_Mono } from 'next/font/google'
import MemoryIcon from '@mui/icons-material/Memory';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DnsIcon from '@mui/icons-material/Dns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const quicksand = Quicksand({ weight: ['500', '600', '700'], subsets: ['latin'] })
const prompt = Prompt({ weight: ['500', '600', '700', '800'], subsets: ['latin'] })
const lexend = Lexend({ weight: ['500', '600', '700'], subsets: ['latin'] })
const roboto_mono = Roboto_Mono({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function Servers() {
  const { sendJsonMessage, getWebSocket } = useWebSocket('ws://192.168.70.213:8000', {
    onOpen: () => {console.log('WebSocket connection opened.'); sendJsonMessage({type: 'list'})},
    onClose: () => console.log('WebSocket connection closed.'),
    shouldReconnect: (closeEvent) => true,
    onMessage: (event) =>  processWebSocketMessages(event)
  });
  const command_input = useRef()
  const console_output = useRef()
  const [status, setStatus] = useState('Loading')
  const [cpuUsage, setCpuUsage] = useState('-')
  const [ramUsage, setRamUsage] = useState({ram_percent: '-', ram_used: "- GB", ram_max: "- GB"})
  const [programList, setProgramsList] = useState([])
  const [logs, setLogs] = useState([])
  const [currentProgram, setCurrentProgram] = useState('???')
  const controls = [  {name: 'Start', color: '#70dc68e8', icon: <PowerSettingsNewIcon />, callback: () => {sendJsonMessage({type: 'power', command: 'start'})}},
                      {name: 'Stop', color: 'dodgerblue', icon: <StopCircleIcon />, callback: () => {sendJsonMessage({type: 'power', command: 'stop'})}}, 
                      {name: 'Restart', color: '#d6c000', icon: <RestartAltIcon />, callback: () => {sendJsonMessage({type: 'power', command: 'restart'})}}, 
                      {name: 'Kill', color: '#d73131', icon: <HighlightOffIcon />, callback: () => {sendJsonMessage({type: 'power', command: 'kill'})}}
                    ]
  function SendCommand(event) {
    sendJsonMessage({type: 'console_command', command: command_input.current.value})
    command_input.current.value = ''
  }
  function processWebSocketMessages(event) {
    let data = JSON.parse(event.data)
    if (data.type === 'resource') {
      setStatus(data.status)
      setCpuUsage(data.cpu_usages)
      setRamUsage({ram_percent: data.ram_percent, ram_used: data.ram_used, ram_max: data.ram_max})
    } else if (data.type === 'list') {
      setCurrentProgram(data.program)
      setProgramsList(data.programs)
    } else if (data.type === 'console_logs') {
      if (logs.length !== data.logs.length) {
        setLogs(data.logs)
        console_output.current.scrollTop = console_output.current.scrollHeight;
      }
    }
  }
  function changeProgram(event) {
    setCurrentProgram(event.target.ariaLabel)
    sendJsonMessage({type: 'change_program', program: event.target.ariaLabel})
  }
  return (
    <div className={'inner-container'}>
      <div className={'inner-container-first'}>
        <div className={'system-stats'}>
          <span className={['system-stats-header', prompt.className].join(' ')}>Stats</span>
          <div className={'system-resources'}>
            <div className={'system-resources-container'}>
              <span className={['system-resources-title', prompt.className].join(' ')}><DnsIcon />Program</span>
              <span className={['system-resources-value', quicksand.className].join(' ')}>{currentProgram}</span>         
            </div>
            <div className={'system-resources-container'}>
              <span className={['system-resources-title', prompt.className].join(' ')}><InfoOutlinedIcon />Status</span>
              <span className={['system-resources-value', quicksand.className].join(' ')} style={{ color: (status == 'Online') ? 'green' : 'red' }}>{status}</span>         
            </div>
            <div className={'system-resources-container'}>
              <span className={['system-resources-title', prompt.className].join(' ')}><MemoryIcon />CPU</span>
              <span className={['system-resources-value', quicksand.className].join(' ')}>{cpuUsage} % / 100 %</span>         
            </div>
            <div className={'system-resources-container'}>
              <span className={['system-resources-title', prompt.className].join(' ')}><MemoryIcon /> RAM</span>
              <span className={['system-resources-value', quicksand.className].join(' ')}>{ramUsage.ram_used} / {ramUsage.ram_max}</span>         
            </div>
          </div>
          <div className={'system-control'}>
            {controls.map(cont => (<button key={cont.name} style={{ backgroundColor: cont.color }} onClick={cont.callback} className={['control-button', quicksand.className].join(' ')}>{cont.icon}{cont.name}</button>))}
          </div>
        </div>
        <div className={'programs-list'}>
          <span className={['programs-list-header', prompt.className].join(' ')}>Programs</span>
          <div className={'programs-list-container'}>
            {programList.map(s => <div key={s} onClick={event => changeProgram(event)} aria-label={s} className={'programs_inner'}><DnsIcon />{s}</div>)}
          </div>
        </div>
      </div>
      <div className={'inner-container-second'}>
        <div className={'system-console'}>
          <span className={['system-console-header', prompt.className].join(' ')}>Console</span>
          <div ref={console_output} className={'system-console-output'}>
            {logs.map(log => (<span key={Math.random()*100} className={['logs', roboto_mono.className].join(' ')}>{log}</span>))}
          </div>
          <div className={'system-console-control'}>
            <input ref={command_input} onKeyDown={s => ((s.code === 'Enter') ? SendCommand(s) : '')} className={['system-console-input', lexend.className].join(' ')} placeholder='Enter the Command'></input>
            <button onClick={s => SendCommand(s)} className={['system-console-send', lexend.className].join(' ')}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
