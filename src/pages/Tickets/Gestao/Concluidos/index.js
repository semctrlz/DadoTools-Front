/* eslint-disable react/prop-types */
/* eslint-disable no-plusplus */
import React, { useState, useEffect } from 'react';
import {
  MdSearch,
  MdStar,
  MdNavigateBefore,
  MdNavigateNext,
  MdAttachFile,
} from 'react-icons/md';

import ReactPaginate from 'react-paginate';
import { parseISO, format } from 'date-fns';
import { FiUser, FiFolder, FiFilter } from 'react-icons/fi';
import api from '~/services/api';

import { Container, Sidebar } from './global_ticket_styles';

import history from '~/services/history';
import './styles.css';

export default function Concluidos(props) {
  const [tickets, setTickets] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets_, setTickets_] = useState([]);
  const [consulta, setConsulta] = useState('');
  const [filtrado, setFiltrado] = useState(false);
  const [usuario, setUsuario] = useState({});

  const [cbxAssunto, setCbxAssunto] = useState(true);
  const [cbxCorpo, setCbxCorpo] = useState(true);
  const [cbxCategoria, setCbxCategoria] = useState(true);
  const [cbxSubcategoria, setCbxSubcategoria] = useState(true);

  useEffect(() => {
    async function AtualizaDados() {
      const id =
        props.match.params.id === undefined ? 0 : props.match.params.id;
      const retorno = await api.get(
        `tickets/gestao/concluidos/${id}?page=${pagina}`
      );
      setTickets(retorno.data.tickets);
      setTickets_(retorno.data.tickets);
      setUsuario(retorno.data.usuario);

      setTotalTickets(retorno.headers['x-total-count']);
    }

    AtualizaDados();
  }, [pagina]);

  function RetornaAvaliacao(avaliacao) {
    if (avaliacao) {
      switch (avaliacao.nota) {
        case 1:
          return (
            <div>
              {' '}
              <MdStar />
            </div>
          );
        case 2:
          return (
            <div>
              <MdStar />
              <MdStar />
            </div>
          );
        case 3:
          return (
            <div>
              <MdStar />
              <MdStar />
              <MdStar />
            </div>
          );
        case 4:
          return (
            <div>
              <MdStar />
              <MdStar />
              <MdStar />
              <MdStar />
            </div>
          );
        case 5:
          return (
            <div>
              <MdStar />
              <MdStar />
              <MdStar />
              <MdStar />
              <MdStar />
            </div>
          );
        default:
          return '-';
      }
    } else {
      return '-';
    }
  }

  function handlePageClick(e) {
    const { selected } = e;
    setPagina(selected + 1);
    console.tron.log(pagina + 1);
  }

  function FiltraFechados() {
    setTickets(
      tickets_.filter(t => {
        return t.status === 'S';
      })
    );
  }

  function GetEncerramentoReal(ticket) {
    const quantEncerramentos = ticket.encerramentos.length;
    if (quantEncerramentos === 0) {
      return '-';
    }
    if (quantEncerramentos === 1) {
      return ticket.encerramentos[0].createdAt;
    }
    if (quantEncerramentos > 1) {
      if (ticket.encerramentos[0].id_usuario === ticket.id_destinatario) {
        return ticket.encerramentos[0].createdAt;
      }
      return ticket.encerramentos[1].createdAt;
    }
  }

  function RetornalabelPrazo(ticket) {
    if (ticket.prazo) {
      const _prazo = new Date(ticket.prazo);
      const _encerramento = new Date(GetEncerramentoReal(ticket));

      if (_prazo < _encerramento) {
        return (
          <>
            <span>
              {ticket.prazo
                ? format(parseISO(ticket.prazo), 'dd/MM/yy HH:mm')
                : '-'}
            </span>
            <span className="label red">fora do prazo</span>
          </>
        );
      }
      return (
        <span>
          {ticket.prazo
            ? format(parseISO(ticket.prazo), 'dd/MM/yy HH:mm')
            : '-'}
        </span>
      );
    }
    return '-';
  }
  function HandleChangeConsulta(consultaBusca) {
    setConsulta(consultaBusca);
  }

  function HandleChangeAssunto() {
    setCbxAssunto(!cbxAssunto);
  }
  function HandleChangeCorpo() {
    setCbxCorpo(!cbxCorpo);
  }
  function HandleChangeCategoria() {
    setCbxCategoria(!cbxCategoria);
  }
  function HandleChangeSubcategoria() {
    setCbxSubcategoria(!cbxSubcategoria);
  }

  async function LimpaFiltros() {
    setFiltrado(false);
    setCbxAssunto(true);
    setCbxCorpo(true);
    setCbxCategoria(true);
    setCbxSubcategoria(true);
    setConsulta('');
    setPagina(1);
    const retorno = await api.get(`tickets/concluidos?page=${pagina}`);
    setTickets(retorno.data);
    setTickets_(retorno.data);
    setTotalTickets(retorno.headers['x-total-count']);
  }

  async function BuscaDados() {
    const urlCosulta = 'tickets/concluidos/filtro';
    const retorno = await api.get(
      `${urlCosulta}?page=1&busca=${consulta}&assunto=${
        cbxAssunto ? 't' : 'f'
      }&corpo=${cbxCorpo ? 't' : 'f'}&cat=${cbxCategoria ? 't' : 'f'}&subcat=${
        cbxSubcategoria ? 't' : 'f'
      }`
    );
    setTickets(retorno.data);
    setTickets_(retorno.data);
    setTotalTickets(retorno.headers['x-total-count']);
    setPagina(1);
    setFiltrado(true);
  }

  return (
    <Container>
      <div className="title-header">
        <p>
          Enviados por <strong>{usuario.nome}</strong> e concluídos
        </p>
      </div>
      <div className="content-page">
        <Sidebar>
          <table className="side-table hide">
            <thead>
              <tr>
                <th>
                  <p>Filtros</p>
                  <FiFilter />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="filtros">
                  <div className="custom-search">
                    <input
                      placeholder="Buscar"
                      onChange={e => HandleChangeConsulta(e.target.value)}
                      value={consulta}
                      onKeyPress={e => {
                        if (e.which === 13) {
                          BuscaDados();
                        }
                      }}
                    />
                    <button type="button" onClick={BuscaDados}>
                      <MdSearch />
                    </button>
                  </div>
                  <div className="filtrados">
                    <label htmlFor="assunto">
                      <input
                        type="checkbox"
                        id="assunto"
                        name="assunto"
                        checked={cbxAssunto}
                        onChange={HandleChangeAssunto}
                      />
                      Assunto
                    </label>
                    <label htmlFor="corpo">
                      <input
                        type="checkbox"
                        id="corpo"
                        name="corpo"
                        checked={cbxCorpo}
                        onChange={HandleChangeCorpo}
                      />
                      Corpo do ticket
                    </label>
                    <label htmlFor="categoria">
                      <input
                        type="checkbox"
                        id="categoria"
                        name="categoria"
                        checked={cbxCategoria}
                        onChange={HandleChangeCategoria}
                      />
                      Categoria
                    </label>
                    <label htmlFor="subcategoria">
                      <input
                        type="checkbox"
                        id="subcategoria"
                        name="subcategoria"
                        checked={cbxSubcategoria}
                        onChange={HandleChangeSubcategoria}
                      />
                      Subcategoria
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                {filtrado && (
                  <td className="reset-filters">
                    <button type="button" onClick={LimpaFiltros}>
                      Limpar filtros
                    </button>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </Sidebar>
        <div className="body">
          <div className="registros">
            <table className="body-table">
              <thead>
                <tr>
                  <th className="id">
                    <p>#</p>
                  </th>
                  <th className="assunto">
                    <p>ASSUNTO / DESTINATÁRIO / CATEGORIA</p>
                  </th>
                  <th className="propriedade">PRIORIDADE</th>
                  <th className="status">STATUS</th>
                  <th className="data">CRIAÇÃO</th>
                  <th className="prazo">PRAZO</th>
                  <th className="fechamento">ENCERRAMENTO</th>
                  <th className="avaliacao">AVALIAÇÃO</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map(ticket => (
                  <tr
                    onClick={() => {
                      history.push(`/tickets/concluidos/${ticket.id}`);
                    }}
                    key={String(ticket.id)}
                  >
                    <td className="id">{ticket.id}</td>
                    <td className="assunto">
                      <strong>
                        {ticket.anexos && ticket.anexos.length > 0 && (
                          <MdAttachFile />
                        )}
                        {ticket.assunto}
                      </strong>
                      <span>
                        <FiUser size={10} />
                        {ticket.destinatario.nome}
                        <FiFolder size={10} />
                        {ticket.categoria}{' '}
                        {ticket.subcategoria !== '' ? ' - ' : ''}
                        {ticket.subcategoria}
                      </span>
                    </td>
                    <td className="prioridade">
                      <p className={ticket.prioridade_ext.toLowerCase()}>
                        {ticket.prioridade_ext}
                      </p>
                    </td>
                    <td className="status">{ticket.status_ext}</td>
                    <td className="data">
                      {format(parseISO(ticket.createdAt), 'dd/MM/yy HH:mm')}
                    </td>
                    <td className="prazo">{RetornalabelPrazo(ticket)}</td>
                    <td className="fechamento">
                      {ticket.encerramentos.length > 0
                        ? format(
                            parseISO(GetEncerramentoReal(ticket)),
                            'dd/MM/yy HH:mm'
                          )
                        : '-'}
                    </td>
                    <td className="avaliacao">
                      {RetornaAvaliacao(ticket.avaliacao)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="paginacao">
            <p />
            {totalTickets > 20 && (
              <ReactPaginate
                pageCount={Math.trunc(totalTickets / 20)}
                pageRangeDisplayed={4}
                marginPagesDisplayed={1}
                previousLabel={<MdNavigateBefore />}
                nextLabel={<MdNavigateNext />}
                breakLabel="..."
                onPageChange={handlePageClick}
                containerClassName="pagination"
                subContainerClassName="pages"
                activeClassName="active"
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}