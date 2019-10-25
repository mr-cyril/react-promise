// @flow

import { PureComponent } from 'react';

type PropsType = {
  children : any => any,
  cleanOnChange? : ?boolean,
  promises? : { [string] : Promise< any >},
};

type StateType = {
  error : ?any,
  errors : { [string ] : ?any },
  values : { [string ] : ?any },
};

export default class PromisesComponent
  extends PureComponent<PropsType, StateType> {

  prevPromises : ?{ [string] : Promise< any >};

  constructor() {
    super( ...arguments );
    this.state = {
      error: null,
      errors: {},
      values: {},
    };
    this.prevPromises = null;
  }

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate( ) {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const { cleanOnChange, promises } = this.props;
    if ( promises === null || promises === undefined || this.prevPromises === promises ) {
      return;
    }
    if ( cleanOnChange ) {
      this.setState( { error: null, errors: {}, values: {} } );
    }
    this.prevPromises = promises;

    Object.keys( promises ).forEach( key => {
      promises[ key ]
        .then( value => {
          if ( this.prevPromises === promises ) {
            this.setState( state => ( {
              values: {
                ...state.values,
                [ key ]: value,
              },
            } ) );
          }
        } )
        .catch( error => {
          if ( this.prevPromises === promises ) {
            this.setState( state => ( {
              error,
              errors: {
                ...state.errors,
                [ key ]: error,
              },
            } ) );
          }
        } );
    } );
  }

  unsubscribe( ) {
    if ( this.prevPromises !== null ) {
      this.prevPromises = null;
    }
  }

  render() {
    const { children } = this.props;
    const { error, values } = this.state;
    if ( error !== null ) {
      throw error;
    }
    return children( values );
  }
}
