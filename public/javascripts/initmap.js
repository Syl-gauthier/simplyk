function initMap() {
  'use strict';
  let markers = [];
  let adult_index = [];
  let infowindows = [];
  let lts_checked = true;
  let acts_checked = true;
  let age_checked = false;
  let age_printed = 'all';
  let printed = 'all'; //Markers currently onscreen
  let markerCluster = {};

  function listStar(i) {
    listElement = document.getElementById("offers-list").childNodes[0].childNodes[i];
    $(listElement).addClass('starring');
    console.log(listElement);
  }

  function listUnstar(i) {
    listElement = document.getElementById("offers-list").childNodes[0].childNodes[i];
    $(listElement).removeClass('starring');
    console.log(listElement);
  }

  function openListInfos(i) {
    listElement = document.getElementById("offers-list").childNodes[0].childNodes[i];
    listElement.childNodes[2].childNodes[0].click();
    console.log(listElement.childNodes[2]);
  }

  function setMapIfExists(map, i, type) {
    console.log('markers[14] : ' + JSON.stringify(acts[14]));
    if (markers[i]) {
      //Remove the marker even if we zoom
      if (map === null) {
        markerCluster.removeMarker(markers[i]);
        markers[i].setMap(map);
      } else {
        if ((adult_index.indexOf(i) != -1) && (((age_printed == 'kids') && (type != 'adults')) || ((((printed == 'acts') && (i >= acts.length)) || ((printed == 'lts') && (i < acts.length))) && (type == 'adults')))) {
          console.log('Don\'t show this i : ' + i)
        } else {
          console.log('Restablish this i : ' + i)
          markerCluster.addMarker(markers[i]);
          markers[i].setMap(map);
        }
      }
    }
  }
  // Set all markers in the array of the type declared on the map.
  function setMapOnAll(type, map) {
    console.log('In setMapOnAll with markers : ' + String(markers));
    if (type == 'acts') {
      for (let i = 0; i < acts.length; i++) {
        setMapIfExists(map, i, type);
      }
    } else if (type == 'adults') {
      console.log(adult_index + '--> adult_index')
      for (let x = 0; x < adult_index.length; x++) {
        console.log('adult_index[x] : ' + adult_index[x]);
        setMapIfExists(map, adult_index[x], type);
      }
    } else {
      for (let j = 0 + acts.length; j < lts.length + acts.length; j++) {
        setMapIfExists(map, j, type);
      }
    }
  }

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
      if (typeof the_fav._id != 'undefined') {
        if (opp_id.toString() == the_fav._id.toString()) {
          console.log('In the favo generate marker');
          $('#the_favo').unbind('mouseenter mouseleave');
          $('#the_favo').hover(function(e) {
            infoWindow.open(map, marker);
          }, function(e) {
            infoWindow.close();
          });
          marker.addListener('mouseover', function() {
            //infoWindow.open(map, marker);
            $('#the_favo').addClass('starring');
          });
          marker.addListener('mouseout', function() {
            //infoWindow.close();
            $('#the_favo').removeClass('starring');
          });
        } else {
          $('[id=' + opp_id.toString() + '][class=list-group-item]').unbind('mouseenter mouseleave');
          $('[id=' + opp_id.toString() + '][class=list-group-item]').hover(function(e) {
            infoWindow.open(map, marker);
          }, function(e) {
            infoWindow.close();
          });
        };
      } else {
        $('[id=' + opp_id.toString() + '][class=list-group-item]').unbind('mouseenter mouseleave');
        $('[id=' + opp_id.toString() + '][class=list-group-item]').hover(function(e) {
          infoWindow.open(map, marker);
        }, function(e) {
          infoWindow.close();
        });
      };
    } else {
      console.log('Marker is not defined in attachInfoWindow');
    };
  };



  function generateMarkers(map, mks) {
    //Generate markers
    //infowindows = [];
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
    //Attach marker to each acts
    for (let i = 0; i < acts.length; i++) {
      console.log(acts[i].intitule + " marker generated with lat and lon : " + acts[i].lat + acts[i].lon);
      const act = acts[i];
      const lati = act.lat + 0.005 * (Math.random() - 0.5);
      const longi = act.lon + 0.005 * (Math.random() - 0.5);
      //infowindows[i] = {};
      //Relève l'index si l'age minimal est supérieur à 16
      console.log('act.min_age : ' + act.min_age);
      if (act.min_age >= 16) {
        console.log('FOR ADULT : i : ' + i);
        adult_index.push(i);
      };
      infowindows[i] = new google.maps.InfoWindow({
        content: '<b>' + act.org_name + '</b>' + '<br>' + act.intitule,
        disableAutoPan: true
      });
      console.log(acts[i].cause);
      if (acts[i].cause == 'Nature') {
        mks[i] = new google.maps.Marker({
          position: {
            lat: lati,
            lng: longi
          },
          map: map,
          icon: imageEnvFlash,
          clickable: true
        });
      } else if (acts[i].cause == 'Solidarité') {
        mks[i] = new google.maps.Marker({
          position: {
            lat: lati,
            lng: longi
          },
          map: map,
          icon: imageSolFlash,
          clickable: true
        });
      } else if (acts[i].cause == 'Sport et Culture') {
        mks[i] = new google.maps.Marker({
          position: {
            lat: lati,
            lng: longi
          },
          map: map,
          icon: imageCulFlash,
          clickable: true
        });
      } else if (acts[i].cause == 'Enfance') {
        mks[i] = new google.maps.Marker({
          position: {
            lat: lati,
            lng: longi
          },
          map: map,
          icon: imageEnfFlash,
          clickable: true
        });
      } else {
        mks[i] = null;
      }
      attachInfoWindow(mks[i], infowindows[i], act._id);
    };
    //Attach marker to each longterms
    for (let j = 0 + acts.length; j < lts.length + acts.length; j++) {
      const lt = lts[j - acts.length];
      const latj = lt.long_term.lat + 0.005 * (Math.random() - 0.5);
      const longj = lt.long_term.lon + 0.005 * (Math.random() - 0.5);
      //infowindows[j] = {};
      infowindows[j] = new google.maps.InfoWindow({
        content: '<b>' + lt.org_name + '</b>' + '<br>' + lt.long_term.intitule,
        disableAutoPan: true
      });
      console.log('lt.long_term.min_age : ' + lt.long_term.min_age);
      if (lt.long_term.min_age >= 16) {
        console.log('FOR ADULT : j : ' + j);
        adult_index.push(j);
        console.log('adult_index : ' + adult_index);
      };
      //choix du marqueur en fonction de la cause, changer avec le json
      if (lts[j - acts.length].cause == 'Nature') {
        mks[j] = new google.maps.Marker({
          position: {
            lat: latj,
            lng: longj
          },
          map: map,
          icon: imageEnv,
          clickable: true
        });
      } else if (lts[j - acts.length].cause == 'Solidarité') {
        mks[j] = new google.maps.Marker({
          position: {
            lat: latj,
            lng: longj
          },
          map: map,
          icon: imageSol,
          clickable: true
        });
      } else if (lts[j - acts.length].cause == 'Sport et Culture') {
        mks[j] = new google.maps.Marker({
          position: {
            lat: latj,
            lng: longj
          },
          map: map,
          icon: imageCul,
          clickable: true
        });
      } else if (lts[j - acts.length].cause == 'Enfance') {
        mks[j] = new google.maps.Marker({
          position: {
            lat: latj,
            lng: longj
          },
          map: map,
          icon: imageEnf,
          clickable: true
        });
      } else {
        mks[j] = null;
      }
      attachInfoWindow(mks[j], infowindows[j], lt.long_term._id);
    };
    markerCluster = new MarkerClusterer(map, mks, options);
    return mks;
  };
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



  function filterByAge(map) {
    age_checked = !age_checked;
    if (age_checked) {
      $('#age_check').removeClass('fa-square-o');
      $('#age_check').addClass('fa-check-square-o');
    } else {
      $('#age_check').removeClass('fa-check-square-o');
      $('#age_check').addClass('fa-square-o');
    }
    if (age_printed == 'all') {
      $("[adult='true']").addClass('hidden');
      setMapOnAll('adults', null);
      age_printed = 'kids';
    } else {
      if (printed == 'all') {
        $("[adult='true']").removeClass('hidden');
      } else if (printed == 'acts') {
        $("[adult='true'][opp_type='activity']").removeClass('hidden');
      } else if (printed == 'lts') {
        $("[adult='true'][opp_type='longterm']").removeClass('hidden');
      }
      setMapOnAll('adults', map);
      age_printed = 'all';
    }
  }


  // Create legend
  const legend = document.createElement('div');
  legend.id = 'legend';
  let legend_content = [];
  legend_content.push('<h5 class="leaf" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-envira fa-lg fa-fw leaf"></i> Nature </h5><br>');
  legend_content.push('<h5 class="soli" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-heart fa-lg fa-fw soli"></i> Solidarité </h5><br>');
  legend_content.push('<h5 class="cult" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-institution fa-lg fa-fw cult"></i> Sport et culture </h5><br>');
  legend_content.push('<h5 class="child" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-child fa-lg fa-fw child"></i> Enfance </h5>');
  legend.innerHTML = legend_content.join('');
  legend.index = 1;
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
  markers = generateMarkers(map, markers);
  if (page == 'landing') {
    filterByAge(map);
  };



  //MARKERS FILTERING ON MAP MOUVEMENT

  function filterOnLocation() {
    acts.map(activity => {
      console.info(activity.lat);
      if (map.getBounds().contains({
          lat: activity.lat,
          lng: activity.lon
        })) {
        if ((printed == 'all') || (printed == 'acts')) {
          if (page == 'landing') {
            if (age_printed == 'kids') {
              if ($("[id='" + activity._id + "']").attr('adult') == 'true') {
                $("[id='" + activity._id + "']").addClass('hidden');
              } else {
                $("[id='" + activity._id + "']").removeClass('hidden');
              }
            } else {
              $("[id='" + activity._id + "']").removeClass('hidden');
            }
          } else {
            $("[id='" + activity._id + "']").removeClass('hidden');
          }
        } else {
          $("[id='" + activity._id + "']").addClass('hidden');
        }
      } else {
        $("[id='" + activity._id + "']").addClass('hidden');
      }
    });
    lts.map(longterm => {
      /*console.info(longterm._id);
      console.info(longterm.long_term._id + ' sous');*/
      if (map.getBounds().contains({
          lat: longterm.long_term.lat,
          lng: longterm.long_term.lon
        })) {
        /*console.info(longterm._id + 'is contained');
        console.info(longterm.long_term._id + ' sous contained');*/
        if ((printed == 'all') || (printed == 'lts')) {
          if (page == 'landing') {
            if (age_printed == 'kids') {
              if ($("[id='" + longterm.long_term._id + "']").attr('adult') == 'true') {
                $("[id='" + longterm.long_term._id + "']").addClass('hidden');
              } else {
                $("[id='" + longterm.long_term._id + "']").removeClass('hidden');
              }
            } else {
              $("[id='" + longterm.long_term._id + "']").removeClass('hidden');
            }
          } else {
            $("[id='" + longterm.long_term._id + "']").removeClass('hidden');
          }
        } else {
          $("[id='" + longterm.long_term._id + "']").addClass('hidden');
        }
      } else {
        $("[id='" + longterm.long_term._id + "']").addClass('hidden');
      }
    });
  };

  google.maps.event.addListener(map, 'bounds_changed', filterOnLocation);


  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.info('In navigator.geolocation !');

      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }

  $('#acts_filter').click(function() {
    acts_checked = !acts_checked;
    if (acts_checked) {
      $('#acts_check').removeClass('fa-square-o');
      $('#acts_check').addClass('fa-check-square-o');
    } else {
      $('#acts_check').removeClass('fa-check-square-o');
      $('#acts_check').addClass('fa-square-o');
    }
    if (printed != 'acts') {
      if (printed == 'lts') {
        if (age_printed == 'all') {
          $("[opp_type='activity']").removeClass('hidden');
        } else if (age_printed == 'kids') {
          $("[opp_type='activity'][adult='false']").removeClass('hidden');
        }
        setMapOnAll('acts', map);
        printed = 'all';
        filterOnLocation();
      } else {
        if (acts_checked) {
          $("[opp_type='longterm']").addClass('hidden');
          setMapOnAll('lts', null);
          printed = 'acts';
          filterOnLocation();
        } else {
          $("[opp_type='activity']").addClass('hidden');
          setMapOnAll('acts', null);
          printed = 'lts';
          filterOnLocation();
        }
      }
    } else {
      if (age_printed == 'all') {
        $("[opp_type='longterm']").removeClass('hidden');
      } else if (age_printed == 'kids') {
        $("[opp_type='longterm'][adult='false']").removeClass('hidden');
      }
      setMapOnAll('lts', map);
      printed = 'all';
      filterOnLocation();
    }
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
    if (printed != 'lts') {
      if (printed == 'acts') {
        if (age_printed == 'all') {
          $("[opp_type='longterm']").removeClass('hidden');
        } else if (age_printed == 'kids') {
          $("[opp_type='longterm'][adult='false']").removeClass('hidden');
        }
        setMapOnAll('lts', map);
        printed = 'all';
        filterOnLocation();
      } else {
        if (lts_checked) {
          $("[opp_type='activity']").addClass('hidden');
          setMapOnAll('acts', null);
          printed = 'lts';
          filterOnLocation();
        } else {
          $("[opp_type='longterm']").addClass('hidden');
          setMapOnAll('lts', null);
          printed = 'acts';
          filterOnLocation();
        }
      }
    } else {
      if (age_printed == 'all') {
        $("[opp_type='activity']").removeClass('hidden');
      } else if (age_printed == 'kids') {
        $("[opp_type='activity'][adult='false']").removeClass('hidden');
      }
      setMapOnAll('acts', map);
      printed = 'all';
      filterOnLocation();
    }
  });
  $('#age_filter').click(function() {
    filterByAge(map);
    filterOnLocation();
  });

  google.maps.event.addListenerOnce(map, 'tilesloaded', initAutocomplete);
  //AUTOCOMPLETE input
  function initAutocomplete() {
    var loc_bar_options = {
      types: ['address'],
      componentRestrictions: {
        country: 'ca'
      }
    };

    console.info('In initAutocomplete');
    var localization_bar = document.getElementById('address_field');
    console.log('localization_bar ' + localization_bar);
    var autocomplete = new google.maps.places.Autocomplete(localization_bar, loc_bar_options);

    autocomplete.addListener('place_changed', function() {
      console.log('In the place_changed listener !')
      var place = autocomplete.getPlace();
      console.log('place : ' + JSON.stringify(place));
      testAddress();
    });


    var testAddress = function() {
      var place = autocomplete.getPlace();
      var address_string = place.formatted_address;
      console.info('POST to test_address and place : ' + JSON.stringify(place));
      console.info('POST to test_address and address_string : ' + JSON.stringify(address_string));
      $.post('/test_address', {
          address: address_string
        }, function(data) {
          console.info('POST to test_address sent with datas : ' + JSON.stringify(address_string));
        })
        .done(function(data) {
          console.log('There is a place.geometry !' + JSON.stringify(data));
          map.setCenter({
            lat: data.lat,
            lng: data.lon
          });
          map.setZoom(14);
        })
        .fail(function(data) {
          console.log('NO place or place.geometry !' + JSON.stringify(data));
        })
    };

    var geocoder = new google.maps.Geocoder();

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