/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@mui/material';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  TextField, MenuItem, Button, FormControl, InputLabel, Select, Typography, Container, Box, Stepper, Step, StepLabel, List, ListItem, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox, IconButton, Snackbar
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
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

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

const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return '';
  return format(new Date(date), 'dd/MM/yyyy');
};

function Agendamento() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [tipoSelecao, setTipoSelecao] = useState('');
  const [opcaoAtendimento, setOpcaoAtendimento] = useState('');
  const [profissional, setProfissional] = useState('');
  const [data, setData] = useState('');
  const [funcoes, setFuncoes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState({});
  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [events, setEvents] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [openHorariosModal, setOpenHorariosModal] = useState(false);
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const funcoesSnapshot = await getDocs(collection(db, 'dbo.usuario'));
        const funcoesList = funcoesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((funcao) => funcao.ativo);
        setFuncoes(funcoesList);

        const especialidadesSnapshot = await getDocs(collection(db, 'dbo.especialidades'));
        const especialidadesList = especialidadesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((especialidade) => especialidade.ativo);
        setEspecialidades(especialidadesList);

        const pacientesSnapshot = await getDocs(collection(db, 'pacientes_cadastrados'));
        const pacientesList = pacientesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPacientes(pacientesList);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const carregarHorariosOcupados = async () => {
      if (data && profissional) {
        try {
          const docRef = doc(db, 'usuarios_cadastrados', profissional);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const dataDoc = docSnap.data();
            const indisponiveis = dataDoc.disponibilidade?.indisponiveis || [];
            setHorariosOcupados(indisponiveis);
          }
        } catch (error) {
          console.error('Erro ao carregar horários ocupados:', error);
        }
      }
    };
  
    carregarHorariosOcupados();
  }, [data, profissional]);

  useEffect(() => {
    const carregarHorarios = async () => {
      if (profissional) {
        const docRef = doc(db, 'usuarios_cadastrados', profissional);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const horarios = data.disponibilidade?.horarios || {};
          setHorariosDisponiveis(horarios);
          console.log("Horários disponíveis no Step 3:", horarios);
  
          const dias = Object.keys(horarios).filter((dia) => horarios[dia]?.horaInicio && horarios[dia]?.horaFim);
          setDiasDisponiveis(dias);
          const eventos = gerarEventos(horarios, dias);
          setEvents(eventos);
        }
      }
    };
  
    carregarHorarios();
  }, [profissional]);

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
              title: `${diasDaSemana.find((d) => d.value === Number(dia)).label} - Horário disponível`,
              start: eventoInicio,
              end: eventoFim,
            });
          }
        }
      });
    }

    return eventos;
  };

  const gerarHorariosMapaCardiaco = () => {
    // Lógica para gerar horários do Mapa Cardíaco
    return {
      1: { horaInicio: '08:00', horaFim: '12:00' }, // Segunda-feira
      2: { horaInicio: '08:00', horaFim: '12:00' }, // Terça-feira
      // Adicione os outros dias conforme necessário
    };
  };

  const obterDuracaoAtendimento = (horarios) => {
    if (!horarios || Object.keys(horarios).length === 0) {
      console.error("Nenhum horário disponível encontrado.");
      return null;
    }
  
    const horarioAtivo = Object.values(horarios).find(h => h.active);
    if (!horarioAtivo) {
      console.error("Nenhum horário ativo encontrado.");
      return null;
    }
  
    const duracao = parseInt(horarioAtivo.duracaoAtendimento || horarioAtivo.duracaoAtendimentoNormal || "0", 10);
    if (isNaN(duracao) || duracao <= 0) {
      console.error("Duração inválida encontrada.");
      return null;
    }
  
    return { horas: Math.floor(duracao / 60), minutos: duracao % 60 };
  };
  
const recalcularPeriodos = (horario) => {
  if (!horario || !horario.active || !horario.horaInicio || !horario.horaFim) {
    console.error("Dados de horário inválidos ou dia não ativo.");
    return [];
  }

  const duracaoTotal = parseInt(horario.duracaoAtendimento, 10);
  if (isNaN(duracaoTotal) || duracaoTotal <= 0) {
    console.error("Duração inválida.");
    return [];
  }

  const [inicioH, inicioM] = horario.horaInicio.split(':').map(Number);
  const [fimH, fimM] = horario.horaFim.split(':').map(Number);

  let currentH = inicioH;
  let currentM = inicioM;
  const periodos = [];

  while (currentH < fimH || (currentH === fimH && currentM < fimM)) {
    const endM = currentM + duracaoTotal;
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

  const handleTipoSelecaoChange = (event) => {
    setTipoSelecao(event.target.value);
    setOpcaoAtendimento('');
    setProfissional('');
    setProfissionais([]);
    if (event.target.value === 'Mapa Cardíaco') {
      const horariosMapaCardiaco = gerarHorariosMapaCardiaco();
      setHorariosDisponiveis(horariosMapaCardiaco);
      const dias = Object.keys(horariosMapaCardiaco).filter((dia) => horariosMapaCardiaco[dia]?.horaInicio && horariosMapaCardiaco[dia]?.horaFim);
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
      const dias = Object.keys(horariosMapaCardiaco).filter((dia) => horariosMapaCardiaco[dia]?.horaInicio && horariosMapaCardiaco[dia]?.horaFim);
      setDiasDisponiveis(dias);
      const eventos = gerarEventos(horariosMapaCardiaco, dias);
      setEvents(eventos);
    } else {
      const campo = tipoSelecao === 'funcao' ? 'idFuncao' : 'especialidade';

      try {
        const profissionaisSnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
        const profissionaisList = profissionaisSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((profissional) => profissional[campo] === event.target.value);

        setProfissionais(profissionaisList);
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
      setData(event.start);
      setOpenHorariosModal(true);
    }
  };

  const horariosSaoSequenciais = (horarios) => {
    for (let i = 0; i < horarios.length - 1; i++) {
      const [startH, startM] = horarios[i].split(' - ')[1].split(':').map(Number);
      const [nextStartH, nextStartM] = horarios[i + 1].split(' - ')[0].split(':').map(Number);
      if (startH !== nextStartH || startM !== nextStartM) {
        return false;
      }
    }
    return true;
  };

  const handleHorarioSwitch = async (horario, disponivel) => {
    try {
      const docRef = doc(db, 'usuarios_cadastrados', profissional);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const indisponiveis = data.disponibilidade?.indisponiveis || [];
  
        if (!disponivel) {
          // Adicionar horário à lista de indisponíveis
          indisponiveis.push(horario);
        } else {
          // Remover horário da lista de indisponíveis
          const updatedIndisponiveis = indisponiveis.filter((h) => h !== horario);
          data.disponibilidade.indisponiveis = updatedIndisponiveis;
        }
  
        // Atualizar no Firestore
        await updateDoc(docRef, {
          'disponibilidade.indisponiveis': indisponiveis,
        });
  
        console.log('Horário atualizado no banco de dados!');
      }
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
    }
  };
  
  const handleHorarioChange = (horario) => {
    if (horariosOcupados.includes(horario)) {
      return;
    }

    if (allowMultipleSelection) {
      setHorariosSelecionados((prev) => {
        const novosHorarios = prev.includes(horario)
          ? prev.filter((h) => h !== horario)
          : [...prev, horario].sort();

        if (novosHorarios.length > 1 && !horariosSaoSequenciais(novosHorarios)) {
          setAlertMessage('Só é possível selecionar horários consecutivos.');
          setTimeout(() => setAlertMessage(''), 4000);
          return prev;
        }

        return novosHorarios;
      });
    } else {
      setHorariosSelecionados([horario]);
      setOpenHorariosModal(false);
    }
  };

  const handleSalvarHorarios = () => {
    setOpenHorariosModal(false);
  };

  const handleSubmit = async () => {
    try {
      const docRef = doc(db, 'usuarios_cadastrados', profissional);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dataDoc = docSnap.data();
        const horarios = dataDoc.disponibilidade?.horarios || {};
        const horarioOcupado = horarios[format(new Date(data), 'yyyy-MM-dd')]?.some((h) => horariosSelecionados.includes(h));

        if (horarioOcupado) {
          alert('Esse horário já está ocupado. Escolha outro horário.');
          return;
        }

        const horarioConcatenado = horariosSelecionados.join(', ');

        const agendamento = {
          pacienteId: pacienteSelecionado,
          pacienteNome,
          profissionalId: profissional,
          data,
          horario: horarioConcatenado,
        };

        await addDoc(collection(db, 'agendamentos'), agendamento);

        const horariosAtualizados = {
          ...horarios,
          [format(new Date(data), 'yyyy-MM-dd')]: [
            ...(horarios[format(new Date(data), 'yyyy-MM-dd')] || []),
            ...horariosSelecionados,
          ],
        };

        await updateDoc(docRef, {
          'disponibilidade.horarios': horariosAtualizados,
        });

        setSnackbarOpen(true);
        setConfirmDialogOpen(false);
        setTimeout(() => window.location.reload(), 1000); // Atualiza a página após 1 segundo
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      alert('Erro ao confirmar agendamento.');
    }
  };

  const handleCadastroPacienteClick = () => {
    navigate('/pre-cadastro');
  };

  return (
    <Container maxWidth="md">
      <MenuPrincipal />
      <Box className="agendamento-container" display="flex">
        <Box flex={1} marginRight={4}>
          <Stepper activeStep={activeStep} className="stepper">
            {['Serviço', 'Profissional', 'Data e Hora', 'Concluir'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Autocomplete
                  options={pacientes}
                  getOptionLabel={(option) => `${option.nome} (nasc.: ${format(new Date(option.dataNascimento), 'dd/MM/yyyy')})`}
                  renderInput={(params) => <TextField {...params} label="Pesquisar Paciente" fullWidth margin="normal" />}
                  onChange={handlePacienteChange}
                  style={{ flex: 1 }}
                />
                <IconButton color="primary" onClick={handleCadastroPacienteClick}>
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
                    {tipoSelecao === 'funcao' &&
                      funcoes.map((funcao) => (
                        <MenuItem key={funcao.id} value={funcao.id}>
                          {funcao.nome}
                        </MenuItem>
                      ))}
                    {tipoSelecao === 'especialidade' &&
                      especialidades.map((especialidade) => (
                        <MenuItem key={especialidade.id} value={especialidade.id}>
                          {especialidade.nome}
                        </MenuItem>
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
                <Select value={profissional} onChange={(e) => setProfissional(e.target.value)}>
                  {profissionais.map((prof) => (
                    <MenuItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </MenuItem>
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
            </>
          )}

          {activeStep === 3 && (
            <>
              <Typography variant="h6">Confirme os detalhes do agendamento:</Typography>
              <Typography>Paciente: {pacienteNome}</Typography>
              <Typography>Profissional: {profissionais.find((prof) => prof.id === profissional)?.nome}</Typography>
              <Typography>Data: {formatDate(data)}</Typography>
              <Typography>Horário(s): {horariosSelecionados.join(', ')}</Typography>
            </>
          )}

          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)}>
              Voltar
            </Button>
            {activeStep === 3 ? (
              <Button type="submit" variant="contained" color="primary" onClick={() => setConfirmDialogOpen(true)}>
                Confirmar Agendamento
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setActiveStep(activeStep + 1)}>
                Próximo
              </Button>
            )}
          </Box>

          <Dialog open={openHorariosModal} onClose={() => setOpenHorariosModal(false)}>
            <DialogTitle>Horários Disponíveis</DialogTitle>
            <DialogContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowMultipleSelection}
                    onChange={(e) => setAllowMultipleSelection(e.target.checked)}
                  />
                }
                label="Seleção Múltipla"
              />

              {alertMessage && (
                <Typography color="error" variant="body2" align="center" gutterBottom>
                  {alertMessage}
                </Typography>
              )}

              <List>
                {recalcularPeriodos(horariosDisponiveis[getDay(new Date(data))] || {}, {}).map((horario, index) => {
                  const disponivel = !horariosOcupados.includes(horario); // Verifica se o horário está disponível
                  const selecionado = horariosSelecionados.includes(horario); // Verifica se está selecionado para agendamento

                  return (
                    <ListItem key={index} disableGutters style={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        checked={disponivel}
                        onChange={async (e) => {
                          const novoEstado = e.target.checked;
                          if (novoEstado) {
                            setHorariosOcupados((prev) => prev.filter((h) => h !== horario));
                          } else {
                            setHorariosOcupados((prev) => [...prev, horario]);
                          }
                          await handleHorarioSwitch(horario, novoEstado);
                        }}
                        color="primary"
                      />
                      <Typography
                        onClick={() => {
                          if (disponivel) {
                            if (selecionado) {
                              setHorariosSelecionados((prev) => prev.filter((h) => h !== horario));
                            } else {
                              setHorariosSelecionados((prev) => [...prev, horario]);
                            }
                          }
                        }}
                        style={{
                          textDecoration: !disponivel ? 'line-through' : 'none',
                          color: !disponivel ? 'red' : selecionado ? 'blue' : 'black',
                          cursor: disponivel ? 'pointer' : 'not-allowed',
                          fontWeight: selecionado ? 'bold' : 'normal',
                          marginLeft: '8px',
                        }}
                      >
                        {horario}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenHorariosModal(false)} color="secondary">
                Fechar
              </Button>
              <Button onClick={handleSalvarHorarios} color="primary">
                Salvar
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
            <DialogTitle>Confirmação do Agendamento</DialogTitle>
            <DialogContent>
              <Typography>Paciente: {pacienteNome}</Typography>
              <Typography>Profissional: {profissionais.find((prof) => prof.id === profissional)?.nome}</Typography>
              <Typography>Data: {formatDate(data)}</Typography>
              <Typography>Horário(s): {horariosSelecionados.join(', ')}</Typography>
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
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={
          <Box display="flex" alignItems="center">
            <ThumbUpIcon style={{ color: 'green', marginRight: 8 }} />
            Horário agendado com sucesso!
          </Box>
        }
      />
    </Container>
  );
}

export default Agendamento;
