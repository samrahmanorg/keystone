var React = require('react'),
	Field = require('../Field'),
	map,
	googlePlaceService;

function initializeGooglePlaces () {
	var pyrmont = new google.maps.LatLng(0,0);
	map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });

  googlePlaceService = new google.maps.places.PlacesService(map);
}


function searchGooglePlaces(value, callback) {
	//value = encodeURIComponent(value);
	var latLng = new google.maps.LatLng(0,0);
	var request = {
	    query: value
	  };
  	if(!googlePlaceService)
  		initializeGooglePlaces();
	
	googlePlaceService.textSearch(request, callback);

}


module.exports = Field.create({

	debug : require('debug')('google'),

	displayName: 'Goole Place Search',
	
	searchGooglePlacesButtonClicked: function(event) {
		var value = this.refs.googleplacesinput.getDOMNode().value;
		var self = this;
		searchGooglePlaces(value, function(result){
			console.log(result);
			
			var formattedPlaces = [];
			if(result.length > 0){
				for(var i=0;i<result.length;i++) {
					formattedPlaces.push(<li onClick={self.placeSelected} data-places-index={i}>{result[i].name} {result[i].formatted_address}</li>)
				}
			} else {
				formattedPlaces.push((<li>No results found for that query!</li>))
			}

			self.setState({
				'formattedPlaces' : formattedPlaces,
				'places' : result
			})
		})

	},

	handleInputChange: function(element, event){
		//this.state = {places:[],selectedPlace:{name:'Aldos Shoes',formatted_address:'11111'}}


		var newItemValue = event !== "reset" ? event.target.value : '';
		
		var currentState = this.state;

		currentState.selectedPlace[element] = newItemValue;

		this.setState(currentState);
	},

	placeSelected : function(event) {
		var selectedPlaceIndex = event.currentTarget.attributes['data-places-index'].value;
		var selectedPlace = {
			formatted_address : this.state.places[parseInt(selectedPlaceIndex)].formatted_address,
			name : this.state.places[parseInt(selectedPlaceIndex)].name,
			place : this.state.places[parseInt(selectedPlaceIndex)],
			place_id : this.state.places[parseInt(selectedPlaceIndex)].place_id,
			opening_hours : this.state.places[parseInt(selectedPlaceIndex)].opening_hours_text,
			phone_number : this.state.places[parseInt(selectedPlaceIndex)].phone_number,
			source_types : this.state.places[parseInt(selectedPlaceIndex)].source_types,
			website : this.state.places[parseInt(selectedPlaceIndex)].website,
			is_closed : this.state.places[parseInt(selectedPlaceIndex)].is_closed,
			image1 : this.state.places[parseInt(selectedPlaceIndex)].image1,
			image2 : this.state.places[parseInt(selectedPlaceIndex)].image2,
			image3 : this.state.places[parseInt(selectedPlaceIndex)].image3,
			image4 : this.state.places[parseInt(selectedPlaceIndex)].image4,
			image5 : this.state.places[parseInt(selectedPlaceIndex)].image5
		};
		this.setState({
			'selectedPlace' : selectedPlace
		});

	},

	getInitialState : function() {

		return {
			places : [],
			selectedPlace : {
				name : "",
				formatted_address : "",
				opening_hours : "",
				phone_number: "",
				source_types: "",
				website: "",
				is_closed: "",
				image1: "",
				image2: "",
				image3: "",
				image4: "",
				image5: ""
			}
		}

	},

	componentWillMount : function() {

		var gpObj = this.props.values[this.props.path]
		console.log(gpObj);
		console.log("HI");

		if(typeof gpObj!='undefined'){
			this.setState({
				selectedPlace : {
						'name' : gpObj.item_title || "",
						'formatted_address' : gpObj.item_location_short || "",
						'place_id' : gpObj.item_source_reference_id || "",
						'opening_hours' : gpObj.item_opening_hours_text || "",
						'phone_number' : gpObj.item_phone_number || "",
						'source_types' : gpObj.item_source_types || "",
						'website' : gpObj.item_website || "",
						'is_closed' : gpObj.item_closed || "",
						"image1" : gpObj.item_image1 || "",
						"image2" : gpObj.item_image2 || "",
						"image3" : gpObj.item_image3 || "",
						"image4" : gpObj.item_image4 || "",
						"image5" : gpObj.item_image5 || ""
					}
			});
		}
	},
	itemtitleonchange: function(e) {
		e.preventDefault();
		this.setState({'selectedPlace':{'name':e.target.value}})
	},

	renderField : function() {
		
		var itemsListStyle = {
			 'max-height':'300px',
			 'overflow-y':'scroll'
		};
		var hiddenInput = {
			'display':'none'
		};
		var thumbnail = {
			'max-width': '300px',
			'padding':'1em'
		}

		return (
			<div>
				<label htmlFor="google-place-search">Google Places Search</label>
				<fieldset className="form-group">
				  <div className="input-group">
					<input type="text" id="google-place-search" name="googlePlacesSearch" className="form-control" ref="googleplacesinput" />
				    <span className="input-group-btn">
				      <button type="button" className="btn btn-secondary" onClick={this.searchGooglePlacesButtonClicked}>Search</button>
				    </span>
				  </div>
				</fieldset>
				<div style={itemsListStyle}>
					<ul className="google-places-items-list">
						{ this.state.formattedPlaces }
					</ul>
				</div>
				<label>Selected Item</label>
				<fieldset className="form-group"> 
					<input type="hidden" name="selectedPlace" value={this.state.selectedPlace.place_id} ref="selectedPlace" />
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon1">Place Name</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon1" name="itemTitle" value={this.state.selectedPlace.name} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "name")} />
						<span className="input-group-btn">
        					<button className="btn btn-default" style={hiddenInput} type="submit"></button>	        					
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "name", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon2">Formatted Address</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon2" name="itemLocationShort" value={this.state.selectedPlace.formatted_address} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "formatted_address")}  />
						<span className="input-group-btn">
						<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "formatted_address", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon3">Opening Hours</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon3" name="itemHours" value={this.state.selectedPlace.opening_hours} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "opening_hours")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "opening_hours", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon4">Phone Number</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon4" name="itemPhone" value={this.state.selectedPlace.phone_number} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "phone_number")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "phone_number", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon5">Source Types</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon5" name="itemSourceTypes" value={this.state.selectedPlace.source_types} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "source_types")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "source_types", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon6">Website</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon7" name="itemWebsite" value={this.state.selectedPlace.website} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "website")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "website", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon7">Is Closed</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon6" name="itemClosed" value={this.state.selectedPlace.is_closed} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "is_closed")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "is_closed", "reset")}>Reset</button>
    					</span>
					</div>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon8">Image 1</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon8" name="itemImage1" value={this.state.selectedPlace.image1} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "image1")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "image1", "reset")}>Reset</button>
    					</span>
					</div>
					<img src={this.state.selectedPlace.image1} style={thumbnail}></img>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon9">Image 2</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon9" name="itemImage2" value={this.state.selectedPlace.image2} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "image2")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "image2", "reset")}>Reset</button>
    					</span>
					</div>
					<img src={this.state.selectedPlace.image2} style={thumbnail}></img>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon10">Image 3</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon10" name="itemImage3" value={this.state.selectedPlace.image3} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "image3")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "image3", "reset")}>Reset</button>
    					</span>
					</div>
					<img src={this.state.selectedPlace.image3} style={thumbnail}></img>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon11">Image 4</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon11" name="itemImage4" value={this.state.selectedPlace.image4} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "image4")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "image4", "reset")}>Reset</button>
    					</span>
					</div>
					<img src={this.state.selectedPlace.image4} style={thumbnail}></img>
					<br/>
					<div className="input-group">
						<span className="input-group-addon" id="sizing-addon12">Image 5</span>
						<input type="text" className="form-control" aria-describedby="sizing-addon12" name="itemImage5" value={this.state.selectedPlace.image5} ref="selectedPlace" onChange={this.handleInputChange.bind(this, "image5")} />
						<span className="input-group-btn">
							<button className="btn btn-default" style={hiddenInput} type="submit"></button>
        					<button className="btn btn-default" type="submit" onClick={this.handleInputChange.bind(this, "image5", "reset")}>Reset</button>
    					</span>
					</div>
					<img src={this.state.selectedPlace.image5} style={thumbnail}></img>
					<br/>
				</fieldset>
			</div>
		)

	}
	
});

