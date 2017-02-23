function initMap() {
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
  let ponctual_indexes = new Array();
  let longterm_indexes = new Array();

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
  const mapDiv = document.getElementById('map');
  const map = new google.maps.Map(mapDiv, {
    center: {
      lat: 45.503,
      lng: -73.613
    },
    zoom: 12,
    scrollwheel: scrollable,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    }
  });
  const options = {
    gridSize: 50,
    maxZoom: 13,
    minimumClusterSize: 15,
    imagePath: '/images/m'
  };

  // Create legend
  const legend = document.createElement('div');
  legend.id = 'legend';
  let legend_content = [];
  legend_content.push('<h5 id="blop" class="leaf legend" filter="checked" type="leaf" style="margin-top:5px; margin-bottom:5px; cursor: pointer;"><i class="fa fa-check-square-o fa-lg fa-fw leaf"></i> <b>Nature</b> </h5><br>');
  legend_content.push('<h5 class="soli legend" filter="checked" type="soli" style="margin-top:5px; margin-bottom:5px; cursor: pointer;"><i class="fa fa-check-square-o fa-lg fa-fw soli"></i> <b>Solidarité</b> </h5><br>');
  legend_content.push('<h5 class="cult legend" filter="checked" type="cult" style="margin-top:5px; margin-bottom:5px; cursor: pointer;"><i class="fa fa-check-square-o fa-lg fa-fw cult"></i> <b>Sport et culture</b> </h5><br>');
  legend_content.push('<h5 class="child legend" filter="checked" type="child" style="margin-top:5px; margin-bottom:5px; cursor: pointer;"><i class="fa fa-check-square-o fa-lg fa-fw child"></i> <b>Enfance</b> </h5>');
  legend.innerHTML = legend_content.join('');
  legend.index = 1;

  legend.childNodes[0].addEventListener('click', function(event) {
    console.info('Nature filter ');
    if ($(this).attr('filter') == 'checked') {
      $(this).attr('filter', 'unchecked');
      $(this).removeClass('leaf');
      $(this).children().removeClass('leaf');
      $(this).children("i").removeClass('fa-check-square-o');
      $(this).children("i").addClass('fa-square-o');
      hideFromFilters(0);
    } else {
      $(this).attr('filter', 'checked');
      $(this).addClass('leaf');
      $(this).children().addClass('leaf');
      $(this).children("i").removeClass('fa-square-o');
      $(this).children("i").addClass('fa-check-square-o');
      showFromFilters(0);
    }
  });
  legend.childNodes[2].addEventListener('click', function(event) {
    console.info('Solidarity filter');
    if ($(this).attr('filter') == 'checked') {
      $(this).attr('filter', 'unchecked');
      $(this).removeClass('soli');
      $(this).children().removeClass('soli');
      $(this).children("i").removeClass('fa-check-square-o');
      $(this).children("i").addClass('fa-square-o');
      hideFromFilters(1);
    } else {
      $(this).attr('filter', 'checked');
      $(this).addClass('soli');
      $(this).children().addClass('soli');
      $(this).children("i").removeClass('fa-square-o');
      $(this).children("i").addClass('fa-check-square-o');
      showFromFilters(1);
    }
  });
  legend.childNodes[4].addEventListener('click', function(event) {
    console.info('Soprt and culture filter');
    if ($(this).attr('filter') == 'checked') {
      $(this).attr('filter', 'unchecked');
      $(this).removeClass('cult');
      $(this).children().removeClass('cult');
      $(this).children("i").removeClass('fa-check-square-o');
      $(this).children("i").addClass('fa-square-o');
      hideFromFilters(2);
    } else {
      $(this).attr('filter', 'checked');
      $(this).addClass('cult');
      $(this).children().addClass('cult');
      $(this).children("i").removeClass('fa-square-o');
      $(this).children("i").addClass('fa-check-square-o');
      showFromFilters(2);
    }
  });
  legend.childNodes[6].addEventListener('click', function(event) {
    console.info('Children filter');
    if ($(this).attr('filter') == 'checked') {
      $(this).attr('filter', 'unchecked');
      $(this).removeClass('child');
      $(this).children().removeClass('child');
      $(this).children("i").removeClass('fa-check-square-o');
      $(this).children("i").addClass('fa-square-o');
      hideFromFilters(3);
    } else {
      $(this).attr('filter', 'checked');
      $(this).addClass('child');
      $(this).children().addClass('child');
      $(this).children("i").removeClass('fa-square-o');
      $(this).children("i").addClass('fa-check-square-o');
      showFromFilters(3);
    }
  });
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend);

  // Create localization search bar
  const localization_bar_div = document.createElement('div');
  localization_bar_div.id = 'localization_bar_div';
  let loc_bar_content = [];
  loc_bar_content.push('<form class="form-inline" style="margin-top:10px;"">');
  loc_bar_content.push('<input id="address_field" class="form-control" placeholder="Chercher une adresse">');
  loc_bar_content.push('<a id="loc_submit" class="btn btn-default"><i class="fa fa-search"></i></a>');
  loc_bar_content.push('</form>');
  localization_bar_div.innerHTML = loc_bar_content.join('');
  localization_bar_div.index = 1;
  map.controls[google.maps.MapTypeControlStyle.HORIZONTAL_BAR].push(localization_bar_div);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(localization_bar_div);

  //Create the markers
  //Create the info_windows
  const imageSol = {
    url: '/images/Perso/blue-icon-marker.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageEnv = {
    url: '/images/Perso/green-icon-marker.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageCul = {
    url: '/images/Perso/yellow-icon-marker.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageEnf = {
    url: '/images/Perso/red-icon-marker.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageSolFlash = {
    url: '/images/Perso/blue-icon-marker-flash.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageEnvFlash = {
    url: '/images/Perso/green-icon-marker-flash.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageCulFlash = {
    url: '/images/Perso/yellow-icon-marker-flash.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  const imageEnfFlash = {
    url: '/images/Perso/red-icon-marker-flash.svg', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 36)
  };
  //---------------------------------------------------------------------------------------------------------------------------GATHER INFOS AND CREATE MARKERS
  //Gather infos and create marker to each activities
  acts.map(function(act, act_i) {
    const infos_about_act = {};
    infos_about_act._id = act._id;
    infos_about_act.cause = act.cause;
    ponctual_indexes.push(act_i);
    const activity_info_window = new google.maps.InfoWindow({
      content: '<b>' + act.org_name + '</b>' + '<br>' + act.intitule,
      disableAutoPan: true
    });

    let marker_image = {};

    if (act.cause == 'Nature') {
      marker_image = imageEnvFlash;
      nature_indexes.push(act_i);
    } else if (act.cause == 'Solidarité') {
      marker_image = imageSolFlash;
      sol_indexes.push(act_i);
    } else if (act.cause == 'Sport et Culture') {
      marker_image = imageCulFlash;
      culture_indexes.push(act_i);
    } else if (act.cause == 'Enfance') {
      marker_image = imageEnfFlash;
      child_indexes.push(act_i);
    } else {
      marker_image = null;
    }

    if (act.min_age >= 16) {
      adult_indexes.push(act_i);
      infos_about_act.age_filtered = first_age_filtered;
    } else {
      infos_about_act.age_filtered = false;
    }

    const lati = act.lat + 0.005 * (Math.random() - 0.5);
    const longi = act.lon + 0.005 * (Math.random() - 0.5);

    const activity_marker = new google.maps.Marker({
      position: {
        lat: lati,
        lng: longi
      },
      map,
      icon: marker_image,
      clickable: true
    })

    attachInfoWindow(activity_marker, activity_info_window, act._id);

    infos_about_act.marker = activity_marker;
    infos_about_act.info_window = activity_info_window;
    infos_about_act.lat = act.lat;
    infos_about_act.lon = act.lon;
    infos_about_act.type_filtered = false;
    infos_about_act.category_filtered = false;
    if (infos_about_act.category_filtered || infos_about_act.type_filtered || infos_about_act.age_filtered) {
      infos_about_act.marker.setMap(null);
      hideItem(infos_about_act._id);
    }
    infos.push(infos_about_act);

  });
  //Gather infos and create marker to each longterms
  lts.map(function(lt, lt_i) {
    const infos_about_lt = {};
    infos_about_lt._id = lt.long_term._id;
    infos_about_lt.cause = lt.cause;
    longterm_indexes.push(lt_i + acts.length);
    const longterm_info_window = new google.maps.InfoWindow({
      content: '<b>' + lt.org_name + '</b>' + '<br>' + lt.long_term.intitule,
      disableAutoPan: true
    });

    let marker_image = {};

    if (lt.cause == 'Nature') {
      marker_image = imageEnv;
      nature_indexes.push(lt_i + acts.length);
    } else if (lt.cause == 'Solidarité') {
      marker_image = imageSol;
      sol_indexes.push(lt_i + acts.length);
    } else if (lt.cause == 'Sport et Culture') {
      marker_image = imageCul;
      culture_indexes.push(lt_i + acts.length);
    } else if (lt.cause == 'Enfance') {
      marker_image = imageEnf;
      child_indexes.push(lt_i + acts.length);
    } else {
      marker_image = null;
    }

    if (lt.long_term.min_age >= 16) {
      adult_indexes.push(lt_i + acts.length);
      infos_about_lt.age_filtered = first_age_filtered;
    } else {
      infos_about_lt.age_filtered = false;
    }

    const lati = lt.long_term.lat + 0.005 * (Math.random() - 0.5);
    const longi = lt.long_term.lon + 0.005 * (Math.random() - 0.5);

    const longterm_marker = new google.maps.Marker({
      position: {
        lat: lati,
        lng: longi
      },
      map,
      icon: marker_image,
      clickable: true
    })

    attachInfoWindow(longterm_marker, longterm_info_window, lt.long_term._id);

    infos_about_lt.marker = longterm_marker;
    infos_about_lt.info_window = longterm_info_window;
    infos_about_lt.lat = lt.long_term.lat;
    infos_about_lt.lon = lt.long_term.lon;
    infos_about_lt.type_filtered = false;
    infos_about_lt.category_filtered = false;
    if (infos_about_lt.category_filtered || infos_about_lt.type_filtered || infos_about_lt.age_filtered) {
      infos_about_lt.marker.setMap(null);
      hideItem(infos_about_lt._id);
    }
    infos.push(infos_about_lt);
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



  function attachInfoWindow(marker, infoWindow, opp_id) {
    if (marker) {
      marker.addListener('click', function() {
        $("." + opp_id).modal();
      });
      marker.addListener('mouseover', function() {
        infoWindow.open(map, marker);
      });
      marker.addListener('mouseout', function() {
        infoWindow.close();
      });
      $('[id=' + opp_id.toString() + ']').unbind('mouseenter mouseleave');
      $('[id=' + opp_id.toString() + ']').hover(function(e) {
        infoWindow.open(map, marker);
      }, function(e) {
        infoWindow.close();
      });
    } else {
      console.log('Marker is not defined in attachInfoWindow');
    };
  };
  //---------------------------------------------------------------------------------------------------------------------------DEFINE FILTERS FUNCTION

  function hideFromFilters(index) {
    if (index == 0) {
      nature_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].category_filtered = true;
        hideItem(infos[ind]._id);
      });
    } else if (index == 1) {
      sol_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].category_filtered = true;
        hideItem(infos[ind]._id);
      });
    } else if (index == 2) {
      culture_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].category_filtered = true;
        hideItem(infos[ind]._id);
      });
    } else if (index == 3) {
      child_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].category_filtered = true;
        hideItem(infos[ind]._id);
      });
    } else if (index == 4) {
      adult_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].age_filtered = true;
        hideItem(infos[ind]._id);
      });
    } else if (index == 5) {
      ponctual_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].type_filtered = true;
        hideItem(infos[ind]._id);
      });
    } else if (index == 6) {
      longterm_indexes.map(function(ind) {
        infos[ind].marker.setMap(null)
        infos[ind].type_filtered = true;
        hideItem(infos[ind]._id);
      });
    };
    filterOnLocation();
  };

  function showFromFilters(index) {
    if (index == 0) {
      nature_indexes.map(function(ind) {
        infos[ind].category_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    } else if (index == 1) {
      sol_indexes.map(function(ind) {
        infos[ind].category_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    } else if (index == 2) {
      culture_indexes.map(function(ind) {
        infos[ind].category_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    } else if (index == 3) {
      child_indexes.map(function(ind) {
        infos[ind].category_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    } else if (index == 4) {
      adult_indexes.map(function(ind) {
        infos[ind].age_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    } else if (index == 5) {
      ponctual_indexes.map(function(ind) {
        infos[ind].type_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    } else if (index == 6) {
      longterm_indexes.map(function(ind) {
        infos[ind].type_filtered = false;
        if (!infos[ind].category_filtered && !infos[ind].type_filtered && !infos[ind].age_filtered) {
          infos[ind].marker.setMap(map);
          showItem(infos[ind]._id);
        }
      });
    };
    filterOnLocation();
  };

  function showItem(id) {
    $('[id=' + id + ']').removeClass('hidden');
  }

  function hideItem(id) {
    $('[id=' + id + ']').addClass('hidden');
  }


  function filterOnLocation() {
    infos.map(function(item) {
      if (!item.category_filtered && !item.type_filtered && !item.age_filtered) {
        if (map.getBounds().contains({
            lat: item.lat,
            lng: item.lon
          })) {
          showItem(item._id);
        } else {
          hideItem(item._id);
        }
      }
    });
  };


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


  //---------------------------------------------------------------------------------------------------------------------------SETUP AUTOCOMPLETE
  //When all the map is loaded, initAutocomplete
  google.maps.event.addListenerOnce(map, 'tilesloaded', initAutocomplete);
  google.maps.event.addListenerOnce(map, 'tilesloaded', filterOnLocation);
  google.maps.event.addListener(map, 'bounds_changed', filterOnLocation);
  //AUTOCOMPLETE input
  function initAutocomplete() {
    var loc_bar_options = {
      types: ['address'],
      componentRestrictions: {
        country: 'ca'
      }
    };

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
          resultsMap.setCenter(results[0].geometry.location);
          resultsMap.setZoom(14);
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  };
}
