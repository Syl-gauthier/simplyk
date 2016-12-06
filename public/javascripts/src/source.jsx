import React from 'react';
import ReactDOM from 'react-dom';
import Moment from 'moment';

class DayItem extends React.Component {
	constructor(){
		super();
		this.state = {
			valid: 'u'
		}
	}
	/*
	validate(value) {
		console.log('Input date val : ' + value);
		if (Moment(value).isValid()){
			this.setState({
				valid: 'y'
			});
		} else {
			this.setState({
				valid: 'n'
			});
		}
	};*/

	render(){
		return(
			<div key={this.props.day.name}>
				<div className="pickadatediv input-group conn-input">
					<span className="input-group-addon">{this.props.day.title}</span>
					<DatePicker name={this.props.day.name} placeholder="Choisis un jour (yyyy-mm-dd)" id={this.props.day.name} /*validate={this.validate}*/ required/>
				</div>
			</div>
		)

	}
}


class DatePicker extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			value: null,
			valid: 'u'
		};
	}

	componentDidMount() {
		this.setupDatepicker();
	}

	componentDidUpdate() {
		this.setupDatepicker();
	}

	setupDatepicker() {
		// cache this so we can reference it inside the datepicker
		var comp = this;
		// the element
		var el = this.refs.datepicker;
		$(el).pickadate({
			format: 'yyyy-mm-dd',
			formatSubmit: 'yyyy-mm-dd',
			selectMonths: true,
			selectYears: 5,
			onSet: function(e) {   
				// you can use any of the pickadate options here
				var val = this.get('select', 'yyyy-mm-dd');
				comp.onDateChange({target: {value: val}});
			}
		});
	}

		onDateChange(event) {
			this.setState({operand: event.target.value});
		};
	
		render() {
			return (
				<input type="date" ref="datepicker" key={this.props.name} name={this.props.name} value={this.state.value} className="datepicker form-control" placeholder="Choisis un jour (yyyy-mm-dd)" /*onBlur={this.props.validate(this.state.value)}*/ required/>);
		}
}


class TimePicker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: null,
			valid: 'u'
		};
	}

	componentDidMount() {
		this.setupTimepicker();
	}

	componentDidUpdate() {
		this.setupTimepicker();
	}

	setupTimepicker() {
		// cache this so we can reference it inside the timepicker
		var comp = this;
		// the element
		var el = this.refs.timepicker;
		$(el).pickatime({
			onSet: function(e) {   
				// you can use any of the pickatime options here
				var val = this.get('select');
				comp.onDateChange({target: {value: val}});
			}
		});
	}

		onDateChange(event) {
			this.setState({operand: event.target.value});
		};
	
		render() {
			if (this.props.required == 'true'){
				if (this.props.checked == 'true'){
					return (
						<input type="text" key={this.props.name} ref="timepicker" name={this.props.name} value={this.state.value} className="timepicker form-control" placeholder={this.props.placeholder} /*onBlur={this.props.validate(this.state.value)}*/ required/>);
				} else {
					return (
						<input type="text" key={this.props.name} ref="timepicker" name={this.props.name} value={this.state.value} className="timepicker form-control" placeholder={this.props.placeholder} /*onBlur={this.props.validate(this.state.value)}*/ disabled/>);
				}
			} else {
				return (
					<input type="text" key={this.props.name} ref="timepicker" name={this.props.name} value={this.state.value} className="timepicker form-control" placeholder={this.props.placeholder} /*onBlur={this.props.validate(this.state.value)}*//>);
			}
		}
}


class DayInActivity extends React.Component {
	constructor(props) {
		super(props);
	};

	isDisabled() {
		if(this.props.checked == 'true'){
			console.log('Checked')
			return(<input type="number" key={this.props.activity + '_' + this.props.day + '_vol_nb'} name={this.props.activity + '_' + this.props.day + '_vol_nb'} className='form-control' id='min_age' min='1' max='10000' required/>)
		} else {
			console.log('Not checked')
				return(<input type="number" key={this.props.activity + '_' + this.props.day + '_vol_nb'} name={this.props.activity + '_' + this.props.day + '_vol_nb'} className='form-control' id='min_age' min='1' max='10000' disabled/>)
		}
	}

	render(){
		if (this.props.required == 'true'){
			return(
				<div className="row" >
					<div className="col-md-3">
						<label >
							<input type="checkbox" value='on' key={this.props.activity + '_' + this.props.day} name={this.props.activity + '_' + this.props.day} onChange={()=>this.props.onChange()} required/> {'Jour ' + (this.props.i + 1)}
						</label>
					</div>
					<div className="col-md-3">
						<TimePicker placeholder='Début' key={this.props.activity + '_' + this.props.day + '_startTime'} name={this.props.activity + '_' + this.props.day + '_startTime'} required='true' checked={this.props.checked}/>
					</div>
					<div className="col-md-3">
						<TimePicker placeholder='Fin' key={this.props.activity + '_' + this.props.day + '_endTime'} name={this.props.activity + '_' + this.props.day + '_endTime'} required='true' checked={this.props.checked}/>
					</div>
					<div className="col-md-3">
						{this.isDisabled()}
					</div>
				</div>)
		} else {
			return(
				<div className="row" >
					<div className="col-md-3">
						<label >
							<input type="checkbox" value='on' key={this.props.activity + '_' + this.props.day} name={this.props.activity + '_' + this.props.day} onChange={()=>this.props.onChange()}/> {'Jour ' + (this.props.i + 1)}
						</label>
					</div>
					<div className="col-md-3">
						<TimePicker placeholder='Début' key={this.props.activity + '_' + this.props.day + '_startTime'} name={this.props.activity + '_' + this.props.day + '_startTime'} required='false' checked={this.props.checked}/>
					</div>
					<div className="col-md-3">
						<TimePicker placeholder='Fin' key={this.props.activity + '_' + this.props.day + '_endTime'} name={this.props.activity + '_' + this.props.day + '_endTime'} required='false' checked={this.props.checked}/>
					</div>
					<div className="col-md-3">
						{this.isDisabled()}
					</div>
				</div>)}
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
					<input type="checkbox" value='on' checked={this.state.isChecked} onChange={()=>this.onChange()}/> Ajouter un âge minimal
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
		console.info('this.props.days : ' + this.props.days);
		this.state = {
			days_list: new Array(this.props.days.length).fill(false)
		}
	}

	componentWillReceiveProps(nextProps){
		if (this.props.days.length < nextProps.days.length){
			console.log('typeof this.state.days_list : ' + typeof this.state.days_list);
			console.log('this.state.days_list : ' + JSON.stringify(this.state.days_list));
			this.state.days_list.push(false);
			console.log('this.state.days_list : ' + JSON.stringify(this.state.days_list));
			const days_pushed = this.state.days_list;
			console.log('this.state.days_list : ' + JSON.stringify(this.state.days_list));
			this.setState({
				days_list: days_pushed
			});
			console.log('Had just push false in days_list and new days_list : ' + this.state.days_list);
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
				<h2 className='text-center'>{'Tâche ' + (this.props.n + 1)}</h2>
				<div type='button' className='btn btn-default' onClick={() => this.props.removeActivity()}>Supprimer la tâche</div>
				<div className="input-group conn-input">
					<span className="input-group-addon">Titre de la tâche</span>
					<input type="text" className="form-control" id={"activity" + (this.props.n + 1) + "_intitule_activity"} name={"activity" + (this.props.n + 1) + "_intitule_activity"} required/>
				</div>
				<div className="input-group conn-input">
					<span className="input-group-addon">Description de la tâche</span>
					<input type="text" className="form-control" id={"activity" + (this.props.n + 1) + "_activity_description"} name={"activity" + (this.props.n + 1) + "_description_activity"} required/>
				</div>
				<div className="row">
					<div className="col-md-3 col-md-offset-3"><p><strong>Heure de début</strong></p></div>
					<div className="col-md-3"><p><strong>Heure de fin</strong></p></div>
					<div className="col-md-3"><p><strong>Nombres de bénévoles</strong></p></div>
				</div>
				{this.props.days.map(function(day, i){
					if (this.state.days_list.indexOf(true) != -1){
						if (this.state.days_list[i]){
							return(
								<DayInActivity i={i} onChange={()=>this.onChange(i)} activity={'activity' + (this.props.n+1)} day={'day'+(i+1)} required='true' checked='true'/>
							)
						} else {
							return(
								<DayInActivity i={i} onChange={()=>this.onChange(i)}  activity={'activity' + (this.props.n+1)} day={'day'+(i+1)} required='false' checked='false'/>
							)
						}
					} else {
						return(
							<DayInActivity i={i} onChange={()=>this.onChange(i)} activity={'activity' + (this.props.n+1)} day={'day'+(i+1)} required='true' checked='false'/>
						)
					}
				}, this)}
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
				<div className="input-group conn-input" id='address_container'>
					<span className="input-group-addon">Adresse de l'évènement</span>
					<input type="address" className="form-control" id="address" name="address" required/>
				</div>
				<div className="input-group">
					<span className="input-group-addon">Description de l'évènement</span>
					<textarea className="form-control" id="description" name="event_description" rows="6" required/>
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
		};
		console.log('this.state.days ' + JSON.stringify(this.state.days));
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
		console.log('this.state.days ' + JSON.stringify(this.state.days));
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

	getDaysToRender() {
		const to_render = this.state.days.map(function(day){
			console.log('day.name : ' + day.name);
			return day.name;
		});
		return to_render;
	}

	render() {
		return (
			<div>
				<h1>Mon évènement</h1>
				<form action="addevent" method="post" id="creationeventform" name="creationeventform" style={{paddingBottom: '100px'}}>
					<BasicInfos />
					<h4>Dates de l'évènement</h4>
					<p className="alert alert-danger hidden" id="day-alert">Chaque jour doit être défini par une date</p>
					<div>
						{this.state.days.map(function(day){
							return <DayItem day={day} key={day.name}/>
						})}
					</div>
					<div className="btn btn-default" onClick={() => {this.addADay()}} id="addADay"> Ajouter un jour</div>
					<AgeItem />
					<div style={{paddingBottom: '40px'}}>
						{(new Array(this.state.nbActivities)).fill(1).map(function(d, i){
							return <ActivityItem n={i} key={i} days={this.getDaysToRender()} removeActivity={()=>{this.removeActivity()}}/>
						}, this)}
					</div>
					<div className="btn btn-default" onClick={() => {this.addAnActivity()}} id="addAnActivity"> Ajouter une tâche</div>
					<input className="btn btn-default" type='Submit' id="submit" value='Terminer'></input>
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

ActivityItem.propTypes = {
	n: React.PropTypes.number,
	key: React.PropTypes.number,
	removeActivity: React.PropTypes.func,
	days: React.PropTypes.arrayOf(React.PropTypes.string)
}

DayItem.propTypes = {
	key: React.PropTypes.number,
	day: React.PropTypes.object
}