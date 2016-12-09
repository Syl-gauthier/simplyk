'use strict';
import React from 'react';
import ReactDOM from 'react-dom';


class ClassesTable extends React.Component {
	constructor(){
		super();
		this.state = {};
		const url = '/admin/classes__react'; 
		this.getDatas(url);
	}

	getDatas(url){
		fetch(url, {
			method: 'GET'
			})
		.then((response) => {console.log('response : ' + JSON.stringify(response));return (response.json())})
		.then((responseJSON) => {
			console.log(responseJSON);
			this.setState({
				datas: responseJSON
			})
		})
	}

	render() {
		return (<div> {this.state.datas} </div>)
	}
}

//------------------------------------------------
ReactDOM.render(
	<ClassesTable/>,
    document.getElementById('table__container')
);