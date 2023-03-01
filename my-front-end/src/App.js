import React from 'react';
import './App.css';


async function sign_up_API(info){
  const url = 'http://52.199.147.207:3000/users';
  const data = `{
  "name":"${info.name}",
  "email":"${info.email}",
  "password":"${info.password}"
  }`;

  // console.log(data);

  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Request-Date': `${new Date().toUTCString()}`,
          'Content-Type': 'application/json',
      },
      body: data,
  });

  const contentType = response.headers.get('Content-Type');
  let responseData;

  if (contentType.includes('application/json')) {
    responseData = await response.json();
    responseData = await responseData.data.user;
    responseData = JSON.stringify(responseData);
  } else {
    responseData = await response.text();
  }

  return responseData
};


function SignUpComponent(props) {
  return(
    <div className="row mt-2 mb-2">
      <div className='col-4'/>
      <div className='col-1 align-right'><label>{props.name}:</label></div>
      <div className='col-2'>
        <input type={props.type} id={props.name} onChange={props.onChange}/>
      </div>
      <div className='col-5'/>
    </div>
  );
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', email: '', password: '', response: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    if (event.target.id === 'name'){
      this.setState({name: event.target.value});
    } else if (event.target.id === 'email'){
      this.setState({email: event.target.value});
    } else if (event.target.id === 'password'){
      this.setState({password: event.target.value});
    }
    // console.log(this.state);
  }

  async handleSubmit() {
    // alert(`${this.state.name} \n ${this.state.email} \n ${this .state.password}`);
    const info = {
      'name': this.state.name, 
      'email': this.state.email,
      'password': this.state.password,
    }
    const message = await sign_up_API(info);
    this.setState({response: message});
    // event.preventDefault();
  }


  renderSignUp(name, type){
    return(
      <SignUpComponent 
        name={name} 
        type={type}
        onChange={this.handleChange}
      />
    )
  }

  render(){
    return(
    <div className='vh-100 d-flex align-items-center'>
      <div className='container'>
        {this.renderSignUp('name', 'text')}
        {this.renderSignUp('email', 'text')}
        {this.renderSignUp('password', 'password')}
        <div className="row mt-2 mb-2">
          <div className='col-5'/>
          <div className='col-2'>
            <button 
              className="btn btn-outline-dark w-50" 
              type="button"
              onClick={() => this.handleSubmit()}
              >Sign Up
            </button>
          </div>
          <div className='col-5'></div>
        </div>
        <div className='mt-2 mb-2'>
          <p className='text-center mt-3 mb-3' id='responseMeassage'>{this.state.response}</p>
        </div>
      </div>
    </div>
    )
  }
}


export default App;
