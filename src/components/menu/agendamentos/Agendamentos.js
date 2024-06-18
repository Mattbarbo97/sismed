/* eslint-disable no-unused-vars, no-loop-func */ // Adiciona essas diretivas no início do arquivo para desabilitar os warnings específicos

import React, { useState, useEffect } from 'react';
import { getFirestore, doc, collection, getDocs, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  TextField, MenuItem, Button, FormControl, InputLabel, Select, Typography, Container, Box, Stepper, Step, StepLabel, IconButton, Modal, List, ListItem, ListItemText
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuPrincipal from '../../menu/MenuPrincipal';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isBefore from 'date-fns/isBefore';
import addDays from 'date-fns/addDays';
import addYears from 'date-fns/addYears';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'pt-BR': require('date-fns/locale/pt-BR'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Agendamento() {
  const [activeStep, setActiveStep] = useState(0);
  const [tipoSelecao, setTipoSelecao] = useState('');
  const [opcaoAtendimento, setOpcaoAtendimento] = useState('');
  const [servico, setServico] = useState('');
  const [Profissional, setProfissional] = useState('');
  const [data, setData] = useState('');
  const [funcoes, setFuncoes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [Profissionals, setProfissionals] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState({});
  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mostrarPacientes, setMostrarPacientes] = useState(false); // Novo estado

  useEffect(() => {
    const carregarDados = async () => {
      const db = getFirestore();

      // Carregar funções
      const funcoesSnapshot = await getDocs(collection(db, "dbo.usuario"));
      const funcoesList = funcoesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(funcao => funcao.ativo); // Filtrar funções inativas
      setFuncoes(funcoesList);

      // Carregar especialidades
      const especialidadesSnapshot = await getDocs(collection(db, "dbo.especialidades"));
      const especialidadesList = especialidadesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(especialidade => especialidade.ativo); // Filtrar especialidades inativas
      setEspecialidades(especialidadesList);

      // Carregar pacientes
      const pacientesSnapshot = await getDocs(collection(db, "pacientes_cadastrados"));
      const pacientesList = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(pacientesList);
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const carregarHorarios = async () => {
      if (Profissional) {
        const docRef = doc(db, 'usuarios_cadastrados', Profissional);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const horarios = data.disponibilidade?.horarios || {};
          setHorariosDisponiveis(horarios);
          const dias = Object.keys(horarios).filter(dia => horarios[dia]?.horaInicio && horarios[dia]?.horaFim);
          setDiasDisponiveis(dias);
          const eventos = gerarEventos(horarios, dias);
          setEvents(eventos);
        }
      }
    };

    carregarHorarios();
  }, [Profissional]);

  const gerarEventos = (horarios, dias) => {
    const eventos = [];
    const dataInicial = new Date();
    const dataFinal = addYears(dataInicial, 1);

    let dataAtual = dataInicial;
    while (dataAtual <= dataFinal) {
      dias.forEach((dia) => {
        const horarioDia = horarios[dia];
        if (horarioDia && horarioDia.horaInicio && horarioDia.horaFim) {
          const [horaInicioH, horaInicioM] = horarioDia.horaInicio.split(':').map(Number);
          const [horaFimH, horaFimM] = horarioDia.horaFim.split(':').map(Number);

          if (!isNaN(horaInicioH) && !isNaN(horaInicioM) && !isNaN(horaFimH) && !isNaN(horaFimM)) {
            const eventoInicio = new Date(dataAtual);
            eventoInicio.setDate(eventoInicio.getDate() + (Number(dia) - getDay(eventoInicio)));
            eventoInicio.setHours(horaInicioH, horaInicioM, 0, 0);
            const eventoFim = new Date(eventoInicio);
            eventoFim.setHours(horaFimH, horaFimM, 0, 0);
            eventos.push({
              title: `${dias.find(d => d === dia)} - Horário disponível`,
              start: eventoInicio,
              end: eventoFim,
            });
          }
        }
      });

      dataAtual = addDays(dataAtual, 1);
    }

    return eventos;
  };

  const handleTipoSelecaoChange = (event) => {
    setTipoSelecao(event.target.value);
    setOpcaoAtendimento('');
    setProfissional('');
    setProfissionals([]);
  };

  const handleOpcaoAtendimentoChange = async (event) => {
    setOpcaoAtendimento(event.target.value);

    const db = getFirestore();
    const campo = tipoSelecao === 'funcao' ? 'idFuncao' : 'especialidade';

    try {
      const ProfissionalsSnapshot = await getDocs(collection(db, "usuarios_cadastrados"));
      const ProfissionalsList = ProfissionalsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(Profissional => Profissional[campo] === event.target.value);
      setProfissionals(ProfissionalsList);
    } catch (error) {
      console.error('Erro ao carregar Profissionals:', error);
    }
  };

  const handleServicoChange = (event) => {
    setServico(event.target.value);
  };

  const handleProfissionalChange = (event) => {
    setProfissional(event.target.value);
  };

  const handleDateChange = (event) => {
    setData(event.target.value);
  };

  const handleHorarioChange = (event) => {
    setHorarioSelecionado(event.target.value);
  };

  const handlePacienteChange = (event, newValue) => {
    if (newValue) {
      setPacienteSelecionado(newValue.id);
      setPacienteNome(`${newValue.nome} (nasc.: ${formatDate(newValue.dataNascimento)})`);
    } else {
      setPacienteSelecionado('');
      setPacienteNome('');
    }
  };

  const handleSearch = () => {
    setMostrarPacientes(true); // Mostrar pacientes ao clicar no botão de pesquisa
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evitar o envio do formulário ao pressionar Enter
      handleSearch(); // Mostrar pacientes ao pressionar Enter
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const agendamento = {
        pacienteId: pacienteSelecionado,
        pacienteNome,
        ProfissionalId: Profissional,
        data,
        horario: horarioSelecionado
      };

      await addDoc(collection(db, 'agendamentos'), agendamento);

      // Dados do evento para enviar ao Google Calendar
      const googleEvent = {
        summary: `Consulta com ${pacienteNome}`,
        location: '',
        description: 'Consulta médica',
        start: new Date(data).toISOString(),
        end: new Date(new Date(data).getTime() + 60 * 60 * 1000).toISOString(), // Exemplo de 1 hora de duração
      };

      await fetch('https://us-central1-unna-6c98e.cloudfunctions.net/addEventToCalendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      });

      alert('Agendamento confirmado!');
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
    }
  };

  const handleAddPaciente = () => {
    alert('Adicionar novo paciente');
  };

  const handleSelectEvent = (event) => {
    setData(event.start);
    setModalOpen(true);
  };

  const steps = ['Serviço', 'Profissional', 'Data e Hora', 'Concluir'];

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const formatHora = (hora) => {
    return hora ? hora.slice(0, 5) : '';
  };

  const gerarPeriodos = (horario) => {
    if (!horario.horaInicio || !horario.horaFim || !horario.duracaoAtendimento) {
      return [];
    }
    const { horaInicio, horaFim, duracaoAtendimento } = horario;
    const periodos = [];
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    const duracao = Number(duracaoAtendimento);

    let currentH = inicioH;
    let currentM = inicioM;

    while (currentH < fimH || (currentH === fimH && currentM < fimM)) {
      const endM = currentM + duracao;
      const endH = currentH + Math.floor(endM / 60);
      const actualEndM = endM % 60;

      if (endH > fimH || (endH === fimH && actualEndM > fimM)) {
        break;
      }

      const startStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      const endStr = `${endH.toString().padStart(2, '0')}:${actualEndM.toString().padStart(2, '0')}`;
      periodos.push(`${startStr} - ${endStr}`);

      currentH = endH;
      currentM = actualEndM;
    }

    return periodos;
  };

  return (
    <Container maxWidth="md">
      <MenuPrincipal />
      <Box className="agendamento-container">
        <Stepper activeStep={activeStep} className="stepper">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <Typography variant="h5" className="header">
            Agendamento Concluído!
          </Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="h4" className="header">Agendar Serviço</Typography>

            {activeStep === 0 && (
              <>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <Autocomplete
                    options={mostrarPacientes ? pacientes : []}
                    getOptionLabel={(option) => `${option.nome} (nasc.: ${formatDate(option.dataNascimento)})`}
                    renderInput={(params) => <TextField {...params} label="Pesquisar Paciente" fullWidth margin="normal" onKeyPress={handleKeyPress} />}
                    onChange={handlePacienteChange}
                    style={{ flex: 1 }}
                  />
                  <IconButton color="primary" onClick={handleSearch}>
                    <AddIcon />
                  </IconButton>
                </Box>

                <FormControl fullWidth margin="normal">
                  <InputLabel className="input-label">Tipo de atendimento</InputLabel>
                  <Select
                    className="select-field"
                    value={tipoSelecao}
                    label="Tipo de atendimento"
                    onChange={handleTipoSelecaoChange}
                  >
                    <MenuItem value="funcao">Terapias e outros</MenuItem>
                    <MenuItem value="especialidade">Especialidade</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel className="input-label">Especialidade/Outros</InputLabel>
                  <Select
                    className="select-field"
                    value={opcaoAtendimento}
                    label="Função/Especialidade"
                    onChange={handleOpcaoAtendimentoChange}
                  >
                    {tipoSelecao === 'funcao' && funcoes.map((funcao) => (
                      <MenuItem key={funcao.id} value={funcao.id}>{funcao.nome}</MenuItem>
                    ))}
                    {tipoSelecao === 'especialidade' && especialidades.map((especialidade) => (
                      <MenuItem key={especialidade.id} value={especialidade.id}>{especialidade.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {activeStep === 1 && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel className="input-label">Profissional</InputLabel>
                  <Select
                    className="select-field"
                    value={Profissional}
                    label="Profissional"
                    onChange={handleProfissionalChange}
                  >
                    {Profissionals.map((atend) => (
                      <MenuItem key={atend.id} value={atend.id}>{atend.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="h6" margin="normal">
                  Paciente: {pacienteNome}
                </Typography>
              </>
            )}

            {activeStep === 2 && (
              <>
                <Typography variant="h6" margin="normal">
                  Selecione uma data:
                </Typography>

                <Box sx={{ height: 500, marginTop: 2 }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    selectable
                    onSelectEvent={handleSelectEvent}
                    messages={{
                      next: "Próximo",
                      previous: "Anterior",
                      today: "Hoje",
                      month: "Mês",
                      week: "Semana",
                      day: "Dia",
                      agenda: "Agenda",
                      date: "Data",
                      time: "Hora",
                      event: "Evento",
                      allDay: "Todo o dia",
                      noEventsInRange: "Não há eventos neste intervalo.",
                    }}
                    components={{
                      event: ({ event }) => {
                        const isPast = isBefore(new Date(event.start), new Date());
                        return (
                          <span style={{ color: isPast ? 'gray' : 'black' }}>
                            {event.title}
                          </span>
                        );
                      }
                    }}
                  />
                </Box>

                <Modal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                >
                  <Box sx={{ margin: 'auto', marginTop: '10%', width: 400, backgroundColor: 'white', padding: 2 }}>
                    <Typography variant="h6" margin="normal">
                      Horários Disponíveis
                    </Typography>
                    <List>
                      {gerarPeriodos(horariosDisponiveis[getDay(new Date(data))] || {}).map((horario, index) => (
                        <ListItem button key={index} onClick={() => { setHorarioSelecionado(horario); setModalOpen(false); }}>
                          <ListItemText primary={horario} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Modal>
              </>
            )}

            <Box display="flex" justifyContent="space-between" marginTop={2}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Voltar
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" color="primary">
                  Confirmar Agendamento
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleNext}>
                  Próximo
                </Button>
              )}
            </Box>
          </form>
        )}
      </Box>
    </Container>
  );
}

export default Agendamento;
