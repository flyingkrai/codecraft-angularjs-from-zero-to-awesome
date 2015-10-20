'use strict';

import 'babel/polyfill';

import _ from 'lodash';
import angular from 'angular';
import 'angular-animate';
import 'angular-ladda';

angular
  .module('persons-app', [
    'ngAnimate',
    require('angular-auto-validate'),
    'angular-ladda'
    ])
  .run(function (bootstrap3ElementModifier, defaultErrorMessageResolver) {
    bootstrap3ElementModifier.enableValidationStateIcons(true);

    defaultErrorMessageResolver
      .setI18nFileRootPath('bower_components/angular-auto-validate/dist/lang/');
    defaultErrorMessageResolver.setCulture('pt-BR');
    defaultErrorMessageResolver.getErrorMessages().then((errorMessages) => {
      errorMessages['tooYoung'] = 'Você precisa ter no mínimo {0} anos de idade para se registrar';
      errorMessages['badUsername'] = 'O usuário só pode conter letras, números e _';
    });
  })
  .controller('ListCtrl', ListCtrl);

ListCtrl.$inject = ['$http'];
function ListCtrl($http) {
  let vm = this;
  vm.persons = [];
  vm.submitting = false;

  getPersons();

  vm.register = () => {
    console.info('> Submitting form', vm.formModel);
    vm.submitting = true;
    $http.post('https://minmax-server.herokuapp.com/register/', this.formModel)
      .then((response) => {
        console.log(`  + Form submitted: ${response.statusText}`);
      }, (response) => {
        console.error(`  - Submit failed: ${response.statusText}`);
      })
      .finally(() => vm.submitting = false);
  };

  function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  function getPersons () {
    $http.get('http://api.randomuser.me/?results=15')
      .then(function (response) {
        let persons = _.pluck(response.data.results, 'user');
        vm.persons = _.map(persons, function (person) {
          person.fullName = `${person.name.first} ${person.name.last}`;
          person.birthdate = randomDate(new Date(1970, 0, 1), new Date(1997, 0, 1));

          return person;
        });
      }, function (response) {
        console.error(response.statusText);
      });
  }
}
