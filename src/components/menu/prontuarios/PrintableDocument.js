//PrintableDocument.js
import React, { useRef } from 'react';
import { Modal, Box, Button } from '@mui/material'; // Importe Button aqui
import { useReactToPrint } from 'react-to-print';
import './PrintableDocumentStyles.css'; // Importa o arquivo de estilos
import logoClinica from '../../../img/logoprint.jpeg'; // Ajuste para o caminho da sua logo

const PrintableDocument = ({ open, onClose, paciente, conteudo, titulo, medico, onDocumentPrinted }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Pedido de Exames',
    onAfterPrint: onClose,
  });

  return (
    <Modal open={open} onClose={onClose} className="modal-background">
    <Box className="page" ref={componentRef}>
    <Box className="header">
        <img className="logo" src={logoClinica} alt="Logo da Clínica" />
        <Box className="clinic-name">
          <Box component="span" className="primary-color">UNNA - EXCELÊNCIA EM SAÚDE</Box>
        </Box>
     </Box>
        
        <Box className="content">
          <Box className="section-content">
            <Box className="section-title">Paciente:</Box>
            <Box>{paciente.nome}</Box>
          </Box>

          <Box className="section-content">
            <Box className="section-title">Pedido:</Box>
            <Box>{conteudo}</Box>
          </Box>
        </Box>

        <Box className="doctor-info">
            <Box component="span">{`Dr(a). ${medico.nome} - CRM: ${medico.crm}`}</Box>
          </Box>
        
        
        
        <Box className="footer">
          <hr />
          <Box component="span" sx={{ display: 'block', textAlign: 'center' }}>
            Rua 23 de Maio, 398 - Guararema | SP | CEP 08900-000
            <br />
            Tel: 11 2626.0606 | 99910.7781 - E-mail: contato@unnasaude.com.br
          </Box>
        </Box>

        <Button className="print-button" onClick={handlePrint}>
          Imprimir Documento
        </Button>
        <Button className="modal-close-button" onClick={onClose}>
          X
        </Button>
      </Box>
    </Modal>
  );
};

export default PrintableDocument;
