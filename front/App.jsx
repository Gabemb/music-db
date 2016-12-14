//Framework and libraries
import React from "react";
import ReactDOM from "react-dom";

//Components
import Login from './components/login/Login';

const App = () => (
	<div>
		<h1>'Sup</h1>
		<Login />
	</div>
)

// getInitialState(){
// 	return {username: ""}
// },
// componentDidMount(){
// 	$.ajax({
// 		type: "GET",
// 		url: "/auth"
// 	})
// 	.done( (username) => {
// 		console.log("User authroization", username)
// 		if (username) {
// 			console.log(username + ' is logged in');
// 			this.setState({username: username});
// 		} else {
// 			console.log('No one is logged in');
// 		}
// 	})
// }

ReactDOM.render(
	<App />,
	document.getElementById('app')
);