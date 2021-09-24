$(document).ready(function () {
  const url = 'http://0.0.0.0:5001/api/v1/';
  $.get(url + 'status/', (data, status) => {
    if (status === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    }
  });

  const amenitiesSelect = {};
  const statesSelect = {};
  const citiesSelect = {};
  $('input:checkbox').change(function () {
    if ($(this).parents('.amenities').length !== 0) {
      check($(this), amenitiesSelect, '.amenities h4');
    } else if ($(this).parents('.locations')) {
      if ($(this).parents('ul').length === 2) {
        check($(this), citiesSelect, '.locations h4');
      } else if ($(this).parents('ul').length === 1) {
        check($(this), statesSelect, '.locations h4');
      }
    }
  });

  const check = (checkbox, filterDict, selector) => {
    if (checkbox.is(':checked')) {
      filterDict[checkbox.parent().attr('data-id')] = checkbox.parent().attr('data-name');
    } else {
      delete filterDict[checkbox.parent().attr('data-id')];
    }
    $(selector).text(Object.values(filterDict).join(', '));
    console.log(filterDict);
  };

  const search = (jsonBody = {}) => {
    $.ajax({
      url: url + 'places_search/',
      type: 'POST',
      data: JSON.stringify(jsonBody),
      contentType: 'application/json ',
      success: (places) => {
        $('section.places').empty();
        for (const place of places) {
          $('section.places').append(`\
            <article>\
              <div class="title_box">\
                <h2>${place.name}</h2>\
                <div class="price_by_night">$${place.price_by_night}</div>\
              </div>\
              <div class="information">\
                <div class="max_guest">
                  ${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}\
                </div>\
                <div class="number_rooms">
                  ${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}\
                </div>\
                <div class="number_bathrooms">
                  ${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}\
                </div>\
              </div>\
              <div class="description">${place.description}</div>\
            </article>\
          `);
        }
      }
    });
  };

  $('#search').click(() => {
    const filters = {
      states: Object.keys(statesSelect),
      cities: Object.keys(citiesSelect),
      amenities: Object.keys(amenitiesSelect)
    };
    search(filters);
  });

  search();
});
