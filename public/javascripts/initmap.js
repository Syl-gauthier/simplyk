function initMap() {
  var markers = [];
  var infowindows = [];
  var lts_checked = true;
  var acts_checked = true;
  var printed = 'all'; //Markers currently onscreen
  

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

  function setMapIfExists(map, i) {
    if (markers[i]) {
      markers[i].setMap(map);
    }
  }
  // Set all markers in the array of the type declared on the map.
  function setMapOnAll(type, map) {
    console.log('In setMapOnAll with markers : ' + String(markers));
    if (type == 'acts') {
      for (i = 0; i < acts.length; i++) {
        setMapIfExists(map, i);
      }
    } else {
      for (j = 0 + acts.length; j < lts.length + acts.length; j++) {
        setMapIfExists(map, j);
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
    for (i = 0; i < acts.length; i++) {
      console.log(acts[i].intitule + " marker generated with lat and lon : " + acts[i].lat + acts[i].lon);
      var act = acts[i];
      var lati = act.lat + 0.005 * (Math.random() - 0.5);
      var longi = act.lon + 0.005 * (Math.random() - 0.5);
      //infowindows[i] = {};
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
    for (j = 0 + acts.length; j < lts.length + acts.length; j++) {
      var lt = lts[j - acts.length];
      var latj = lt.long_term.lat + 0.005 * (Math.random() - 0.5);
      var longj = lt.long_term.lon + 0.005 * (Math.random() - 0.5);
      //infowindows[j] = {};
      infowindows[j] = new google.maps.InfoWindow({
        content: '<b>' + lt.org_name + '</b>' + '<br>' + lt.long_term.intitule,
        disableAutoPan: true
      });
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
    var markerCluster = new MarkerClusterer(map, mks, options);
    return mks;
  };

  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: {
      lat: 45.503,
      lng: -73.613
    },
    zoom: 12,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  var options = {
    gridSize: 50,
    maxZoom: 13,
    minimumClusterSize: 13,
    imagePath: '/images/m'
  };
  var legend = document.createElement('div');
  legend.id = 'legend';
  var content = [];
  content.push('<h5 class="leaf" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-envira fa-lg fa-fw leaf"></i> Nature </h5><br>');
  content.push('<h5 class="soli" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-heart fa-lg fa-fw soli"></i> Solidarité </h5><br>');
  content.push('<h5 class="cult" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-institution fa-lg fa-fw cult"></i> Sport et culture </h5><br>');
  content.push('<h5 class="child" style="margin-top:5px; margin-bottom:5px;"><i class="fa fa-child fa-lg fa-fw child"></i> Enfance </h5>');
  legend.innerHTML = content.join('');
  legend.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend);
  markers = generateMarkers(map, markers);

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
        $("[opp_type='activity']").removeClass('hidden');
        setMapOnAll('acts', map);
        printed = 'all';
      } else {
        if (acts_checked) {
          $("[opp_type='longterm']").addClass('hidden');
          setMapOnAll('lts', null);
          printed = 'acts';
        } else {
          $("[opp_type='activity']").addClass('hidden');
          setMapOnAll('acts', null);
          printed = 'lts';
        }
      }
    } else {
      $("[opp_type='longterm']").removeClass('hidden');
      setMapOnAll('lts', map);
      printed = 'all';
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
        $("[opp_type='longterm']").removeClass('hidden');
        setMapOnAll('lts', map);
        printed = 'all';
      } else {
        if (lts_checked) {
          $("[opp_type='activity']").addClass('hidden');
          setMapOnAll('acts', null);
          printed = 'lts';
        } else {
          $("[opp_type='longterm']").addClass('hidden');
          setMapOnAll('lts', null);
          printed = 'acts';
        }
      }
    } else {
      $("[opp_type='activity']").removeClass('hidden');
      setMapOnAll('acts', map);
      printed = 'all';
    }
  });

}