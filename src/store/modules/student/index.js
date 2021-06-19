// modules student only handle events for a specific student

import _ from 'lodash'
import { checkError, alertMessage } from '@/store/helpers'

export default {
  namespaced: true,
  state: {
    priorities: [],
    isConfirmed: undefined,
    timestamp: null,
    isSigned: undefined,
    signature: ''
  },
  mutations: {
    updatePriorities (state, priorities) {
      state.priorities = priorities
    },
    updateIsSigned (state, isSigned) {
      state.isSigned = isSigned
    },
    updateSignature (state, data) {
      state.signature = data
    },
    updateIsConfirmed (state, isConfirmed) {
      state.isConfirmed = isConfirmed
    },
    updateIs3X (state, is3X) {
      state.is3X = is3X
    },
    updateTimestamp (state, timestamp) {
      state.timestamp = timestamp
    }
  },
  actions: {
    get ({ commit, rootGetters, rootState }) {
      fetch(`./api/student/${rootGetters.userAlias}`, {
        method: 'GET',
        headers: { jwt: rootState.jwt }
      })
        .then(checkError)
        .then(res => res.json())
        .then(json => {
          commit('updatePriorities', json.priorities)
          commit('updateIsConfirmed', json.isConfirmed)
          commit('updateTimestamp', json.timestamp)
        })
        .catch(alertMessage)

      fetch(`./api/signature/${rootGetters.userAlias}`, {
        method: 'GET',
        headers: { jwt: rootState.jwt }
      })
        .then(checkError)
        .then(res => res.json())
        .then(json => {
          commit('updateSignature', json.address)
          commit('updateIsSigned', json.isSigned)
        })
        .catch(alertMessage)
    },
    setSignature (
      { commit, rootGetters, rootState, dispatch },
      { isSigned, data }
    ) {
      commit('updateIsSigned', isSigned)
      commit('updateSignature', data)

      fetch(`./api/signature/${rootGetters.userAlias}/issigned/${isSigned}`, {
        method: 'PUT',
        headers: { jwt: rootState.jwt }
      })
        .then(checkError)
        .then(() => {
          dispatch('get')
        })
        .catch(alertMessage)

      fetch(`./api/signature/${rootGetters.userAlias}`, {
        method: 'PUT',
        headers: { jwt: rootState.jwt },
        body: JSON.stringify({ address: data })
      })
        .then(checkError)
        .then(() => {
          const { role } = rootGetters
          switch (true) {
            case role === 'STUDENT':
              dispatch('get')
              break
            case _.includes(['TEACHER', 'ADMIN'], role):
              dispatch('students/get', null, { root: true })
              break
          }
        })
        .catch(alertMessage)
    },
    updatePriorities (
      { commit, rootState, rootGetters, dispatch },
      priorities
    ) {
      commit('updatePriorities', priorities)
      fetch(`./api/student/${rootGetters.userAlias}/priorities`, {
        method: 'PUT',
        headers: { jwt: rootState.jwt },
        body: JSON.stringify({ priorities })
      })
        .then(checkError)
        .then(() => {
          dispatch('get')
        })
        .catch(alertMessage)
    },
    setIsX3 ({ dispatch, rootState, rootGetters }, { userAlias, isX3 }) {
      fetch(`./api/student/${userAlias}/isx3/${isX3}`, {
        method: 'PUT',
        headers: { jwt: rootState.jwt }
      })
        .then(checkError)
        .then(() => {
          const { role } = rootGetters
          switch (true) {
            case role === 'STUDENT':
              dispatch('get')
              break
            case _.includes(['TEACHER', 'ADMIN'], role):
              dispatch('students/get', null, { root: true })
              break
          }
        })
        .catch(alertMessage)
    },
    setIsConfirmed (
      { dispatch, rootState, rootGetters },
      { userAlias, isconfirmed }
    ) {
      fetch(`./api/student/${userAlias}/isconfirmed/${isconfirmed}`, {
        method: 'PUT',
        headers: { jwt: rootState.jwt }
      })
        .then(checkError)
        .then(() => {
          const { role } = rootGetters
          switch (true) {
            case role === 'STUDENT':
              dispatch('get')
              break
            case _.includes(['TEACHER', 'ADMIN'], role):
              dispatch('students/get', null, { root: true })
              break
          }
        })
        .catch(alertMessage)
    }
  }
}
