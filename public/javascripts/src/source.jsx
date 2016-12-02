import React from 'react';
import ReactDOM from 'react-dom';

class BasicInfos extends React.Component {
	constructor(){
		super();
	}

	render() {
		return (
			<div>			
				<div className="input-group conn-input">
					<span className="input-group-addon">Titre de l'évènement</span>
					<input type="text" className="form-control" id="intitule_event" name="intitule_event" required/>
				</div>
				<div className="input-group conn-input">
					<span className="input-group-addon">Adresse de l'évènement</span>
					<input type="address" className="form-control" id="address" name="intitule_event" required/>
				</div>
				<div className="input-group conn-input">
					<span className="input-group-addon">Adresse de l'évènement</span>
					<input type="address" className="form-control" id="address" name="intitule_event" required/>
				</div>
				<div className="input-group">
					<span className="input-group-addon">Description de l'évènement</span>
					<textarea className="form-control" id="description" name="description" rows="6" required/>
				</div>
				<h4>Dates de l'évènement</h4>
				<p className="alert alert-danger hidden" id="day-alert">Chaque jour doit être défini par une date</p>
				{this.props.days.map(function(day){
					return (
						<div key={day.name}>
							<div className="pickadatediv input-group conn-input">
								<span className="input-group-addon">{day.title}</span>
								<input type="text" name={day.name} className="datepicker form-control" placeholder="Choisis un jour" id={day.name} required/>
							</div>
							<div className="btn btn-default" onClick={() => {this.props.addADay()}} id="addADay"> Ajouter un jour</div>
						</div>
					)
				}), this}
			</div>
		)
	}
}


class EventForm extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			days: [],
			blob: ''
		}
	}

	componentDidMount(){
		const days = [];
		console.info('type of days : ' + typeof days);
		days.push({
				title: 'Jour 1',
				name: 'day1',
				nb: 1,
				value: 0
		});
		console.info('type of days : ' + typeof days);
		this.setState({ days: this.state.days.concat(days) });
	}
	
	addADay(){
		const new_index = this.state.days.length + 1;
		const new_day = [{
			title: 'Jour ' + new_index,
			name: 'day' + new_index,
			nb: new_index,
			value: 0
		}];
		this.setState({
			days: this.state.days.concat(new_day)
		})
	}

	render() {
		console.info('this.state.days : ' + JSON.stringify(this.state.days));
		console.info('type of this.state.days : ' + typeof this.state.days);
		return (
			<div>
				<h2>Mon évènement</h2>
				<form action="addevent" method="post" id="creationeventform" name="creationeventform">
					<BasicInfos days={this.state.days} addADay={()=>this.addADay()}/>
				</form>
			</div>
		)
	}
}


//------------------------------------------------
ReactDOM.render(
	<EventForm />,
    	document.getElementById('form-container')
);