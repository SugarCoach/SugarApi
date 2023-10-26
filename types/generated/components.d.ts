import type { Schema, Attribute } from '@strapi/strapi';

export interface DailyRegisterDailyRegisterComponent extends Schema.Component {
  collectionName: 'components_daily_register_daily_register_component';
  info: {
    displayName: 'DailyRegister-Component';
  };
  attributes: {
    name: Attribute.String;
    icon: Attribute.Media;
  };
}

export interface TreatmentDailyRegisterComponents extends Schema.Component {
  collectionName: 'components_daily_register_daily_register_components';
  info: {
    displayName: 'Treatment Component';
    description: '';
  };
  attributes: {
    name: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'daily-register.daily-register-component': DailyRegisterDailyRegisterComponent;
      'treatment.daily-register-components': TreatmentDailyRegisterComponents;
    }
  }
}
