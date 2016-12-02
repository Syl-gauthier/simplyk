import React from 'react';
import ReactDOM from 'react-dom';

class DayItem extends React.Component {
	constructor(){
		super();
	}

	render(){
		return(
			<div key={this.props.day.name}>
				<div className="pickadatediv input-group conn-input">
					<span className="input-group-addon">{this.props.day.title}</span>
					<input type="text" name={this.props.day.name} className="datepicker form-control" placeholder="Choisis un jour" id={this.props.day.name} required/>
				</div>
			</div>
		)

	}
}

class AgeItem extends React.Component {
	constructor(){
		super();
		this.state = {
			isChecked: false
		}
	}

	onChange(){
		this.setState({
			isChecked: !this.state.isChecked	
		})
	}

	render() {
		return(
			<div className="age__container">
				<label >
					<input type="checkbox" checked={this.state.isChecked} onChange={()=>this.onChange()}/> Ajouter un âge minimal
				</label>
				<div className={this.state.isChecked ? '' : 'hidden'}>
					<div className="input-group conn-input">
						<span className="input-group-addon">Âge minimal</span>
						<input type="number" name='min_age' className="form-control" placeholder="Plus l'âge minimal est faible, plus vous aurez de bénévoles" id='min_age' min='5' max='100'/>
					</div>
				</div>
			</div>
		)
	}
}

class ActivityItem extends React.Component {
	constructor(props){
		super(props);
		console.info('In activity constructor');
		const days_array = [];
		days_array.push(this.props.days);
		console.info('days_array : ' + days_array);
		this.state = {
			days: days_array,
			days_list: new Array(this.props.days.length).fill(false)
		}
	}

	onChange(i){
		let new_days_list = this.state.days_list;
		new_days_list[i] = !new_days_list[i];
		this.setState({
			days_list: new_days_list
		})
	}

	render() {
		console.log('In activity render');
		return(
			<div className="activity__container">
				<h2>{'Tâche ' + (this.props.n + 1)}</h2>
				<button type='button' onClick={() => this.props.removeActivity()}>Supprimer la tâche</button>
				<div className="input-group conn-input">
					<span className="input-group-addon">Titre de la tâche</span>
					<input type="text" className="form-control" id={"activity" + this.props.n + "_intitule_activity"} name={"activity" + this.props.n + "_intitule_activity"} required/>
				</div>
				<div className="input-group conn-input">
					<span className="input-group-addon">Description de la tâche</span>
					<input type="text" className="form-control" id={"activity" + this.props.n + "_description_activity"} name={"activity" + this.props.n + "_description_activity"} required/>
				</div>
				<div className="row">
					<div className="col-md-3 col-md-offset-3"><p><strong>Heure de début</strong></p></div>
					<div className="col-md-3"><p><strong>Heure de fin</strong></p></div>
					<div className="col-md-3"><p><strong>Nombres de bénévoles</strong></p></div>
				</div>
				{this.props.days.map(function(day, i){
					<div className="row">
						<div className="col-md-3">
							<label >
								<input type="checkbox" checked='false' onChange={()=>this.onChange(i)}/> gfiek
							</label>
						</div>
						<div className="col-md-3">
							<input type="number" name='min_age' className="form-control" id='min_age' min='5' max='10000'/>
						</div>
						<div className="col-md-3">
							<input type="number" name='min_age' className="form-control" id='min_age' min='5' max='10000'/>
						</div>
						<div className="col-md-3">
							<input type="number" name='min_age' className="form-control" id='min_age' min='1' max='10000'/>
						</div>
					</div>
				}), this}
			</div>
		)
	}
}


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
					<input type="address" className="form-control" id="address" name="address" required/>
				</div>
				<div className="input-group">
					<span className="input-group-addon">Description de l'évènement</span>
					<textarea className="form-control" id="description" name="description" rows="6" required/>
				</div>
			</div>
		)
	}
}


class EventForm extends React.Component {
	constructor(props){
		super(props);
		const days = [];
		const first_day = {};
		first_day.nb = 1;
		first_day.title = 'Jour 1';
		first_day.name = 'day1';
		days.push(first_day);
		this.state = {
			nbActivities: 1,
			days: days,
			blob: ''
		}
	}

	addADay(){
		const new_index = this.state.days.length + 1;
		const new_day_list = new Array(1);
		const new_day = {};
		new_day.nb = new_index;
		new_day.title = 'Jour ' + new_index;
		new_day.name = 'day' + new_index;
		new_day_list[0] = new_day;
		const new_days = this.state.days.concat(new_day_list);
		this.setState({
			days: new_days
		})
	}

	addAnActivity() {
		const new_nb_activities = this.state.nbActivities + 1;
		this.setState({
			nbActivities: new_nb_activities
		})
	}

	removeActivity() {
		console.info('In activity removal before if');
		if (this.state.nbActivities > 1){
			console.info('In activity removal');
			const new_nb_activities = this.state.nbActivities;
			console.info('new_nb_activities : ' + new_nb_activities);
			this.setState({
				nbActivities: (new_nb_activities - 1)
			})
		}
	}

	render() {
		return (
			<div>
				<h1>Mon évènement</h1>
				<form action="addevent" method="post" id="creationeventform" name="creationeventform">
					<BasicInfos />
					<h4>Dates de l'évènement</h4>
					<p className="alert alert-danger hidden" id="day-alert">Chaque jour doit être défini par une date</p>
					<ul>
						{this.state.days.map(function(day){
							return <DayItem day={day} key={day.nb}/>
						})}
					</ul>
					<div className="btn btn-default" onClick={() => {this.addADay()}} id="addADay"> Ajouter un jour</div>
					<AgeItem />
					<ul>
						{(new Array(this.state.nbActivities)).fill(1).map(function(d, i){
							return <ActivityItem n={i} key={i} days={this.state.days} removeActivity={()=>{this.removeActivity()}}/>
						}, this)}
					</ul>
					<div className="btn btn-default" onClick={() => {this.addAnActivity()}} id="addAnActivity"> Ajouter une tâche</div>
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