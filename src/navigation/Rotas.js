import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';
import Home from '../components/paginas/Home';
import UsuariosCadastrados from '../components/usuarios/UsuariosCadastrados';
import CadastroUsuario from '../components/usuarios/CadastroUsuario';
import CadastroPaciente from '../components/menu/pacientes/CadastroPaciente';
import PacientesCadastrados from '../components/menu/pacientes/PacientesCadastrados';
import ProntuarioEletronico from '../components/menu/prontuarios/CriarProntuario';
import GerenciamentoFuncoes from '../components/usuarios/GerenciamentoFuncoes';
import Agendamentos from '../components/menu/agendamentos/Agendamentos';
import PrintableDocument from '../components/menu/prontuarios/PrintableDocument';
import GestaoHorario from '../components/menu/agendamentos/GestaoHorario';
import VerificarAgendamentos from '../components/menu/agendamentos/VerificarAgendamentos';

function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/usuarios-cadastrados" element={<UsuariosCadastrados />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/cadastro-paciente" element={<CadastroPaciente />} />
      <Route path="/pacientes-cadastrados" element={<PacientesCadastrados />} /> 
      <Route path="/criar-prontuario" element={<ProntuarioEletronico />} />
      <Route path="/gerenciar-funcoes" element={<GerenciamentoFuncoes />} />
      <Route path="/agendamentos" element={<Agendamentos />} />
      <Route path="/printable-document" element={<PrintableDocument />} />
      <Route path="/gestao-horario" element={<GestaoHorario />} />
      <Route path="/verificar-agendamentos" element={<VerificarAgendamentos />} />
      {/* Outras rotas conforme necessário */}
    </Routes>
  );
}

export default Rotas;
