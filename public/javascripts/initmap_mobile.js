'use strict';
let lts_checked = true;
let acts_checked = true;
let age_checked = false;
let first_age_filtered = false;
let markerCluster = {};
let infos = new Array(); //For each activities and longterm, there will be an object in infos with the marker, the infos, the info_window and the filter grid
let nature_indexes = new Array();
let sol_indexes = new Array();
let culture_indexes = new Array();
let child_indexes = new Array();
let adult_indexes = new Array();
let markers = new Array();
let mobile = false;

if (page == 'landing') {
  age_checked = true;
  first_age_filtered = true;
}
/*
0. 1 = Nature, 0 = Non-Nature
1. 1 = Solidarity, 0 = Non-Solidarity
2. 1 = Culture, 0 = Non-Culture
3. 1 = Children, 0 = Non-Children  
4. 0 = Kids, 1 = Adults    
5. 0 = All, 1 = Ponctuals, 2 = Longterms
*/
//---------------------------------------------------------------------------------------------------------------------------DEFINE THE MAP
let scrollable = true;

if (page == 'landing') {
  scrollable = false;
};


// Create localization search bar
const localization_bar_div = document.createElement('div');
localization_bar_div.id = 'localization_bar_div';
let loc_bar_content = [];
loc_bar_content.push('<div id="localization_bar_div" class="center-block hidden-xs" style="margin-right: 5px; margin-left: 5px;">');
loc_bar_content.push('<form class="form-inline" style="margin-top:10px;"><div class="input-group" style="min-width: 25%">');
loc_bar_content.push('<input id="address_field" class="form-control" placeholder="Chercher une adresse">');
loc_bar_content.push('<span id="loc_submit" class="btn btn-default input-group-addon"><i class="fa fa-search"></i></span>');
loc_bar_content.push('</div></form></div>');
localization_bar_div.innerHTML = loc_bar_content.join('');
localization_bar_div.index = 1;
/*map.controls[google.maps.MapTypeControlStyle.HORIZONTAL_BAR].push(localization_bar_div);
map.controls[google.maps.ControlPosition.TOP_CENTER].push(localization_bar_div);*/


//---------------------------------------------------------------------------------------------------------------------------GATHER INFOS AND CREATE MARKERS
//Gather infos and create marker to each activities
acts.map(function(act, act_i) {
  if (act.min_age >= 16) {
    adult_indexes.push(act._id);
    $('#' + act._id).attr('age_filtered', first_age_filtered);
    //act.age_filtered = first_age_filtered;
  } else {
    $('#' + act._id).attr('age_filtered', false);
    //act.age_filtered = false;
  }

  const lati = act.lat + 0.005 * (Math.random() - 0.5);
  const longi = act.lon + 0.005 * (Math.random() - 0.5);

  if (first_age_filtered && act.min_age >= 16) {
    $('#' + act._id).addClass('hidden');
  }

  $('#' + act._id).attr('type_filtered', false);
  $('#' + act._id).attr('category_filtered', false);
  //act.type_filtered = false;
  //act.category_filtered = false;
});
//Gather infos and create marker to each longterms
lts.map(function(lt, lt_i) {

  if (lt.long_term.min_age >= 16) {
    $('#' + lt.long_term._id).attr('age_filtered', first_age_filtered);
    adult_indexes.push(lt.long_term._id);
    //lt.age_filtered = first_age_filtered;
  } else {
    //lt.age_filtered = false;
    $('#' + lt.long_term._id).attr('age_filtered', false);
  }

  const lati = lt.long_term.lat + 0.005 * (Math.random() - 0.5);
  const longi = lt.long_term.lon + 0.005 * (Math.random() - 0.5);

  if (first_age_filtered && lt.long_term.min_age >= 16) {
    $('#' + lt.long_term._id).addClass('hidden');
  }

  $('#' + lt.long_term._id).attr('type_filtered', false);
  $('#' + lt.long_term._id).attr('category_filtered', false);
  //lt.type_filtered = false;
  //lt.category_filtered = false;
});

/*markerCluster = new MarkerClusterer(map, function() {
  let markers = new Array();
  infos.map(function(item) {
    if ((infos.marker).getMap()) {
      markers.push(infos.marker)
    }
  });
  return markers;
}, options);*/

//---------------------------------------------------------------------------------------------------------------------------DEFINE FILTERS FUNCTION

function hideFromFilters(index) {
  if (index == 0) {
    nature_indexes.map(function(id) {
      $('#' + id).addClass('hidden').attr('category_filtered', true);
    });
  } else if (index == 1) {
    sol_indexes.map(function(id) {
      $('#' + id).addClass('hidden').attr('category_filtered', true);
    });
  } else if (index == 2) {
    culture_indexes.map(function(id) {
      $('#' + id).addClass('hidden').attr('category_filtered', true);
    });
  } else if (index == 3) {
    child_indexes.map(function(id) {
      $('#' + id).addClass('hidden').attr('category_filtered', true);
    });
  } else if (index == 4) {
    adult_indexes.map(function(id) {
      $('#' + id).addClass('hidden').attr('age_filtered', true);
    });
  } else if (index == 5) {
    $('[opp_type="activity"]').each(function() {
      let id = $(this).attr('id');
      $(this).attr('type_filtered', true).addClass('hidden');
    });
  } else if (index == 6) {
    $('[opp_type="longterm"]').each(function() {
      let id = $(this).attr('id');
      $(this).attr('type_filtered', true).addClass('hidden');
    });
  };
  synthesis();
};

function showFromFilters(index) {
  if (index == 0) {
    nature_indexes.map(function(id) {
      let item = $('#' + id);
      item.attr('category_filtered', false);
      if ((item.attr('category_filtered') == 'false') && (item.attr('type_filtered') == 'false') && (item.attr('age_filtered') == 'false')) {
        item.removeClass('hidden');
      }
    });
  } else if (index == 1) {
    sol_indexes.map(function(id) {
      let item = $('#' + id);
      item.attr('category_filtered', false);
      if ((item.attr('category_filtered') == 'false') && (item.attr('type_filtered') == 'false') && (item.attr('age_filtered') == 'false')) {
        item.removeClass('hidden');
      }
    });
  } else if (index == 2) {
    culture_indexes.map(function(id) {
      let item = $('#' + id);
      item.attr('category_filtered', false);
      if ((item.attr('category_filtered') == 'false') && (item.attr('type_filtered') == 'false') && (item.attr('age_filtered') == 'false')) {
        item.removeClass('hidden');
      }
    });
  } else if (index == 3) {
    child_indexes.map(function(id) {
      let item = $('#' + id);
      item.attr('category_filtered', false);
      if ((item.attr('category_filtered') == 'false') && (item.attr('type_filtered') == 'false') && (item.attr('age_filtered') == 'false')) {
        item.removeClass('hidden');
      }
    });
  } else if (index == 4) {
    adult_indexes.map(function(id) {
      let item = $('#' + id);
      item.attr('age_filtered', false);
      if ((item.attr('category_filtered') == 'false') && (item.attr('type_filtered') == 'false') && (item.attr('age_filtered') == 'false')) {
        item.removeClass('hidden');
      }
    });
  } else if (index == 5) {
    $('[opp_type="activity"]').each(function() {
      let id = $(this).attr('id');
      $(this).attr('type_filtered', false);
    });
  } else if (index == 6) {
    $('[opp_type="longterm"]').each(function() {
      let id = $(this).attr('id');
      $(this).attr('type_filtered', false);
    });
  }
  synthesis();
};


function synthesis() {
  $('[category_filtered="false"][type_filtered="false"][age_filtered="false"]').each(function() {
    $(this).removeClass('hidden');
  });
};

//Geolocalization
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    var to_send = new google.maps.LatLng(pos);
    //$('#info__geolocatlisation').text('Tu es géolocalisé')
    console.info('In navigator.geolocation !');
    handleGeolocation(to_send);
  });
} else {
  to_send = new google.maps.LatLng({
    lat: 45.503,
    lng: -73.613
  });
  handleGeolocation(to_send);
}


//---------------------------------------------------------------------------------------------------------------------------HANDLE EVENTS ON FILTER BUTTONS

$('#acts_filter').click(function() {
  acts_checked = !acts_checked;
  if (acts_checked) {
    $('#acts_check').removeClass('fa-square-o');
    $('#acts_check').addClass('fa-check-square-o');
  } else {
    $('#acts_check').removeClass('fa-check-square-o');
    $('#acts_check').addClass('fa-square-o');
  }
  /*
  0. 1 = Nature, 0 = Non-Nature
  1. 1 = Solidarity, 0 = Non-Solidarity
  2. 1 = Culture, 0 = Non-Culture
  3. 1 = Children, 0 = Non-Children  
  4. 0 = Kids, 1 = Adults    
  5. 0 = All, 1 = Ponctuals, 2 = Longterms
  */
  if ((acts_checked && lts_checked) || (!acts_checked && !lts_checked)) {
    showFromFilters(5);
    showFromFilters(6);
  } else if (acts_checked && !lts_checked) {
    showFromFilters(5);
    hideFromFilters(6);
  } else {
    hideFromFilters(5);
    showFromFilters(6);
  };
});

$('#lts_filter').click(function() {
  lts_checked = !lts_checked;
  if (lts_checked) {
    $('#lts_check').removeClass('fa-square-o');
    $('#lts_check').addClass('fa-check-square-o');
  } else {
    $('#lts_check').removeClass('fa-check-square-o');
    $('#lts_check').addClass('fa-square-o');
  }
  /*
  0. 1 = Nature, 0 = Non-Nature
  1. 1 = Solidarity, 0 = Non-Solidarity
  2. 1 = Culture, 0 = Non-Culture
  3. 1 = Children, 0 = Non-Children  
  4. 0 = Kids, 1 = Adults    
  5. 0 = All, 1 = Ponctuals, 2 = Longterms
  */
  if ((acts_checked && lts_checked) || (!acts_checked && !lts_checked)) {
    showFromFilters(5);
    showFromFilters(6);
  } else if (acts_checked && !lts_checked) {
    showFromFilters(5);
    hideFromFilters(6);
  } else {
    hideFromFilters(5);
    showFromFilters(6);
  };
});


$('#age_filter').click(function() {
  age_checked = !age_checked;
  if (age_checked) {
    $('#age_check').removeClass('fa-square-o');
    $('#age_check').addClass('fa-check-square-o');
  } else {
    $('#age_check').removeClass('fa-check-square-o');
    $('#age_check').addClass('fa-square-o');
  }

  if (age_checked) {
    hideFromFilters(4);
  } else {
    showFromFilters(4);
  };
});

var loc_bar_options = {
  types: ['address'],
  componentRestrictions: {
    country: 'ca'
  }
};

function handleGeolocation(pos) {
  console.log('pos : ' + JSON.stringify(pos));
  $("li", "#jetsContent").each(function() {
    var distb = {};
    distb.lat = Number($(this).attr('lat'));
    distb.lng = Number($(this).attr('lon'));
    var dist = google.maps.geometry.spherical.computeDistanceBetween(pos, new google.maps.LatLng(distb));
    if (dist == NaN) {
      $(this).find('.dist').text('Nombre inconnu de ');
    } else {
      $(this).find('.dist').text(Math.round(dist / 100) / 10);
    }
  });
  $("li", "#jetsContent").sort(function(a, b) {
    var at = $(a).find('.dist').text();
    var bt = $(b).find('.dist').text();
    if ((Number(at) <= Number(bt)) || (bt == 'NaN')) {
      return -1;
    } else if (Number(at) > Number(bt) || (at == 'NaN')) {
      return 1;
    } else {
      console.log('at : ' + at);
      console.log('bt : ' + bt);
      return 0;
    }
  }).appendTo("#jetsContent");
};


function initAutocomplete() {
  var geocoder = new google.maps.Geocoder();

  console.info('In initAutocomplete');
  var localization_bar = document.getElementById('address_field');
  console.log('localization_bar ' + localization_bar);
  var autocomplete = new google.maps.places.Autocomplete(localization_bar, loc_bar_options);

  autocomplete.addListener('place_changed', function() {
    console.log('In the place_changed listener !')
    var place = autocomplete.getPlace();
    console.log('place : ' + JSON.stringify(place));
    geocodeAddress(geocoder, map);
  });


  //GEOCODING SERVICE
  document.getElementById('loc_submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });

  $('#address_field').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      geocodeAddress(geocoder, map);
    }
  });

  function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address_field').value;
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        console.log('results[0].geometry.location : ' + results[0].geometry.location);
        handleGeolocation(results[0].geometry.location);
        /*resultsMap.setCenter(results[0].geometry.location);
        resultsMap.setZoom(14);*/
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };
}