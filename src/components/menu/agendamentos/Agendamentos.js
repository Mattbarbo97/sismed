/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  TextField, MenuItem, Button, FormControl, InputLabel, Select, Typography, Container, Box, Stepper, Step, StepLabel, IconButton, Modal, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuPrincipal from '../../menu/MenuPrincipal';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
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

const diasDaSemana = [
  { label: 'Segunda-feira', value: 1 },
  { label: 'Terça-feira', value: 2 },
  { label: 'Quarta-feira', value: 3 },
  { label: 'Quinta-feira', value: 4 },
  { label: 'Sexta-feira', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 0 },
];

// Função para gerar os horários do Mapa Cardíaco
const gerarHorariosMapaCardiaco = () => {
  const horarios = {};
  const dias = [1, 2, 3, 4, 5]; // Segunda a Sexta

  dias.forEach(dia => {
    if (dia === 5) {
      // Sexta-feira
      horarios[dia] = { horaInicio: '08:00', horaFim: '11:00', duracaoAtendimento: 60 }; // Atendimentos de 1 hora
    } else {
      horarios[dia] = { horaInicio: '08:00', horaFim: '19:00', duracaoAtendimento: 60 }; // Atendimentos de 1 hora
    }
  });

  return horarios;
};

// Função para formatar datas com verificação de validade
const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return ''; // Verifica se a data é válida
  return format(new Date(date), 'dd/MM/yyyy');
};

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
  const [mostrarPacientes, setMostrarPacientes] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Carregar dados de funções, especialidades e pacientes
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar funções
        const funcoesSnapshot = await getDocs(collection(db, "dbo.usuario"));
        const funcoesList = funcoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(funcao => funcao.ativo);
        setFuncoes(funcoesList);

        // Carregar especialidades
        const especialidadesSnapshot = await getDocs(collection(db, "dbo.especialidades"));
        const especialidadesList = especialidadesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(especialidade => especialidade.ativo);
        setEspecialidades(especialidadesList);

        // Carregar pacientes
        const pacientesSnapshot = await getDocs(collection(db, "pacientes_cadastrados"));
        const pacientesList = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPacientes(pacientesList);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, []);

  // Carregar horários do profissional
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
  
    for (let dataAtual = dataInicial; dataAtual <= dataFinal; dataAtual = addDays(dataAtual, 1)) {
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
              title: `${diasDaSemana.find(d => d.value === Number(dia)).label} - Horário disponível`,
              start: eventoInicio,
              end: eventoFim,
            });
          }
        }
      });
    }
  
    return eventos;
  };

  const handleTipoSelecaoChange = (event) => {
    setTipoSelecao(event.target.value);
    setOpcaoAtendimento('');
    setProfissional('');
    setProfissionals([]);
    if (event.target.value === 'Mapa Cardíaco') {
      const horariosMapaCardiaco = gerarHorariosMapaCardiaco();
      setHorariosDisponiveis(horariosMapaCardiaco);
      const dias = Object.keys(horariosMapaCardiaco).filter(dia => horariosMapaCardiaco[dia]?.horaInicio && horariosMapaCardiaco[dia]?.horaFim);
      setDiasDisponiveis(dias);
      const eventos = gerarEventos(horariosMapaCardiaco, dias);
      setEvents(eventos);
      setActiveStep(2);
    }
  };

  const handleOpcaoAtendimentoChange = async (event) => {
    setOpcaoAtendimento(event.target.value);

    if (event.target.value === 'Mapa Cardíaco') {
      const horariosMapaCardiaco = gerarHorariosMapaCardiaco();
      setHorariosDisponiveis(horariosMapaCardiaco);
      const dias = Object.keys(horariosMapaCardiaco).filter(dia => horariosMapaCardiaco[dia]?.horaInicio && horariosMapaCardiaco[dia]?.horaFim);
      setDiasDisponiveis(dias);
      const eventos = gerarEventos(horariosMapaCardiaco, dias);
      setEvents(eventos);
    } else {
      const campo = tipoSelecao === 'funcao' ? 'idFuncao' : 'especialidade';

      try {
        const ProfissionalsSnapshot = await getDocs(collection(db, "usuarios_cadastrados"));
        const ProfissionalsList = ProfissionalsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(Profissional => Profissional[campo] === event.target.value);
        
        setProfissionals(ProfissionalsList);
      } catch (error) {
        console.error('Erro ao carregar Profissionais:', error);
      }
    }
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

  const handleSelectEvent = (event) => {
    if (event && event.start) {
      setData(event.start); // Verifique se event.start é válido antes de definir o estado
      setModalOpen(true);
    }
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

  const handleHorarioChange = (horario) => {
    setHorarioSelecionado(horario);
    setConfirmDialogOpen(true); // Abrir a confirmação após o horário ser selecionado
  };

  const handleSubmit = async () => {
    try {
      // Checar se o horário já está ocupado
      const docRef = doc(db, 'usuarios_cadastrados', Profissional);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dataDoc = docSnap.data();
        const horarios = dataDoc.disponibilidade?.horarios || {};
        const horarioOcupado = horarios[format(new Date(data), 'yyyy-MM-dd')]?.includes(horarioSelecionado);
        
        if (horarioOcupado) {
          alert('Esse horário já está ocupado. Escolha outro horário.');
          return;
        }

        // Salvar agendamento
        const agendamento = {
          pacienteId: pacienteSelecionado,
          pacienteNome,
          ProfissionalId: Profissional,
          data,
          horario: horarioSelecionado
        };

        await addDoc(collection(db, 'agendamentos'), agendamento);

        // Atualizar horários no documento do profissional
        const horariosAtualizados = {
          ...horarios,
          [format(new Date(data), 'yyyy-MM-dd')]: [
            ...(horarios[format(new Date(data), 'yyyy-MM-dd')] || []),
            horarioSelecionado
          ]
        };

        await updateDoc(docRef, {
          'disponibilidade.horarios': horariosAtualizados
        });

        alert('Agendamento confirmado e horário bloqueado!');
        setConfirmDialogOpen(false); // Fechar o diálogo de confirmação
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      alert('Erro ao confirmar agendamento.');
    }
  };

  return (
    <Container maxWidth="md">
      <MenuPrincipal />
      <Box className="agendamento-container">
        <Stepper activeStep={activeStep} className="stepper">
          {['Serviço', 'Profissional', 'Data e Hora', 'Concluir'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Autocomplete
                  options={pacientes} // Usando a lista de pacientes carregados
                  getOptionLabel={(option) => `${option.nome} (nasc.: ${format(new Date(option.dataNascimento), 'dd/MM/yyyy')})`}
                  renderInput={(params) => <TextField {...params} label="Pesquisar Paciente" fullWidth margin="normal" />}
                  onChange={handlePacienteChange}
                  style={{ flex: 1 }}
                />
                <IconButton color="primary" onClick={() => setMostrarPacientes(true)}>
                  <AddIcon />
                </IconButton>
              </Box>

              <FormControl fullWidth margin="normal">
                <InputLabel>Buscar por...</InputLabel>
                <Select value={tipoSelecao} onChange={handleTipoSelecaoChange}>
                  <MenuItem value="funcao">Função</MenuItem>
                  <MenuItem value="especialidade">Especialidade</MenuItem>
                  <MenuItem value="Mapa Cardíaco">Mapa Cardíaco</MenuItem>
                </Select>
              </FormControl>

              {tipoSelecao !== 'Mapa Cardíaco' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Função/Especialidade</InputLabel>
                  <Select value={opcaoAtendimento} onChange={handleOpcaoAtendimentoChange}>
                    {tipoSelecao === 'funcao' && funcoes.map((funcao) => (
                      <MenuItem key={funcao.id} value={funcao.id}>{funcao.nome}</MenuItem>
                    ))}
                    {tipoSelecao === 'especialidade' && especialidades.map((especialidade) => (
                      <MenuItem key={especialidade.id} value={especialidade.id}>{especialidade.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

          {activeStep === 1 && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Profissional</InputLabel>
                <Select value={Profissional} onChange={(e) => setProfissional(e.target.value)}>
                  {Profissionals.map((prof) => (
                    <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="h6">Paciente: {pacienteNome}</Typography>
            </>
          )}

          {activeStep === 2 && (
            <>
              <Typography variant="h6">Selecione uma data e horário:</Typography>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable
                onSelectEvent={handleSelectEvent}
              />

              {/* Modal de horários */}
              {modalOpen && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <button className="modal-close-button" onClick={() => setModalOpen(false)}>&times;</button>
                    <Typography className="modal-title">Horários Disponíveis</Typography>
                    <List>
                      {gerarPeriodos(horariosDisponiveis[getDay(new Date(data))] || {}).map((horario, index) => (
                        <ListItem button key={index} onClick={() => handleHorarioChange(horario)} className="list-item">
                          <ListItemText primary={horario} />
                        </ListItem>
                      ))}
                    </List>
                  </div>
                </div>
              )}
            </>
          )}

          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)}>Voltar</Button>
            {activeStep === 3 ? (
              <Button type="submit" variant="contained" color="primary">Confirmar Agendamento</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setActiveStep(activeStep + 1)}>Próximo</Button>
            )}
          </Box>
        </form>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Confirmação do Agendamento</DialogTitle>
          <DialogContent>
            <Typography>Paciente: {pacienteNome}</Typography>
            <Typography>Profissional: {Profissionals.find(prof => prof.id === Profissional)?.nome}</Typography>
            <Typography>Data: {data ? formatDate(data) : 'Data não selecionada'}</Typography>
            <Typography>Horário: {horarioSelecionado}</Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Agendamento;
