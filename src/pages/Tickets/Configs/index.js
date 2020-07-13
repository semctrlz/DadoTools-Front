/* eslint-disable react/no-this-in-sfc */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import Agrupamentos from './Fragments/Agrupamentos';
import Categorizacao from './Fragments/Categorizacao';
import Users from './Fragments/Users';

import { Container } from './styles';
import './styles.css';
import api from '~/services/api';
import history from '~/services/history';

export default function Configs() {
  // const profile = useSelector(state => state.user.profile);

  const [categVisible, setCategVisible] = useState(false);
  const [userVisible, setUserVisible] = useState(true);
  const [grupoVisible, setGrupoVisible] = useState(false);

  useEffect(() => {
    async function Inicializa() {
      const apiResponse = await api.get('userapps');
      const { data } = apiResponse;
      const [resultado] = data.filter(linha => {
        return linha.Apps.rota === 'tickets';
      });

      if (!resultado || resultado.nivel < 3) {
        history.push('/tickets');
      }
    }
    Inicializa();
  }, []);

  function renderMenu() {
    if (categVisible) {
      return <Categorizacao />;
    }
    if (grupoVisible) {
      return <Agrupamentos />;
    }

    return <Users />;
  }

  function AtivaMenu(nome) {
    setCategVisible(false);
    setGrupoVisible(false);
    setUserVisible(false);

    switch (nome) {
      case 'categ':
        setCategVisible(true);
        break;
      case 'agrup':
        setGrupoVisible(true);
        break;
      case 'user':
        setUserVisible(true);
        break;
      default:
        break;
    }
  }

  return (
    <Container>
      <ul className="tab-menu">
        <li
          className={categVisible ? 'selected' : ''}
          onClick={() => AtivaMenu('categ')}
        >
          Categorização
        </li>
        <li
          className={userVisible ? 'selected' : ''}
          onClick={() => AtivaMenu('user')}
        >
          Usuários
        </li>
        <li
          className={grupoVisible ? 'selected' : ''}
          onClick={() => AtivaMenu('agrup')}
        >
          Grupos
        </li>
      </ul>
      <div className="conteudo">{renderMenu()}</div>
    </Container>
  );
}
