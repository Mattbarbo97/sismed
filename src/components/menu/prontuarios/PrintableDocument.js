import React, { useRef } from 'react';
import { Modal, Box, Button } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import './PrintableDocumentStyles.css';
import logoClinica from '../../../img/logoprint.jpeg';

const PrintableDocument = ({ open, onClose, paciente, conteudo, titulo, medico, onDocumentPrinted }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Documento Médico',
    onAfterPrint: () => {
      onDocumentPrinted();
    },
  });

  return (
    <Modal open={open} onClose={onClose} className="modal-background">
      <Box className="modal-wrapper">
        <Box className="page" ref={componentRef}>
          <Box className="header">
            <img className="logo" src={logoClinica} alt="Logo da Clínica" />
            <Box className="title">
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
              <Box dangerouslySetInnerHTML={{ __html: conteudo }} />
            </Box>
          </Box>

          <Box className="spacer"></Box> {/* Adiciona o espaçamento extra */}

          <Box className="doctor-info">
            <Box component="span">{`Dr(a). ${medico.nome} - CRM: ${medico.crm}`}</Box>
          </Box>
          
          <Box className="doctor-signature">
            <Box component="span" className="signature-line">____________________________</Box>
            <Box component="span" className="signature-label">Assinatura do Médico</Box>
          </Box>
          
          <Box className="footer">
            <hr />
            <Box component="span" sx={{ display: 'block', textAlign: 'center' }}>
              Rua 23 de Maio, 398 - Guararema | SP | CEP 08900-000
              <br />
              Tel: 11 2626.0606 | 99910.7781 - E-mail: contato@unnasaude.com.br
            </Box>
          </Box>
        </Box>
        <Box className="button-container-print">
          <Button className="custom-button print-button" onClick={handlePrint}>
            IMPRIMIR DOCUMENTO
          </Button>
          <Button className="custom-button cancel-button" onClick={onClose}>
            CANCELAR IMPRESSÃO
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PrintableDocument;
