import React from 'react';
import {Link} from 'react-router'
import $ from 'jquery';

const Login = React.createClass({
	getInitialState() {
		return {username: "", password: ""};
	},
	submitLoginInfo(e){
		$.ajax({
			type: 'POST',
			url: "/login",
			data: this.state
		})
		.done( (data) => {
			console.log("User recieved data", data);
		});
	},
	updateState(e){

		let target = e.target.name;
		let value = e.target.value

		this.setState({[target]: value})

	},
	render(){
		console.log(this.state)
		return (
			<form onSubmit={this.submitLoginInfo}>
				<h3>Username: </h3>
				<input onChange={this.updateState} type="text" placeholder="username" name="username"></input>

				<h3>Password: </h3>
				<input onChange={this.updateState} type="text" placeholder="password" name="password"></input>

				<button>Log In</button>
			</form>	
		)
	}
})

export default Login;