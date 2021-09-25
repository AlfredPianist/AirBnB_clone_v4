$(document).ready(function () {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const daySuffix = ['st', 'nd', 'rd'];
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
      filterDict[checkbox.parent().attr('data-id')] = checkbox
        .parent()
        .attr('data-name');
    } else {
      delete filterDict[checkbox.parent().attr('data-id')];
    }
    $(selector).text(Object.values(filterDict).join(', '));
  };

  const searchPlaces = (jsonBody = {}) => {
    $.ajax({
      url: url + 'places_search/',
      type: 'POST',
      data: JSON.stringify(jsonBody),
      contentType: 'application/json ',
      success: (places) => {
        $('section.places').empty();
        for (const place of places) {
          $('section.places').append(`\
            <article id="${place.id}">\
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
              <div class="reviews">\
                <div class="reviews-title">\
                  <h2>Reviews</h2>\
                  <span class="show-reviews">Show</span>\
                </div>
                <ul></ul>\
              </div>\
            </article>\
          `);
        }
      }
    });
  };

  const searchUser = (userID, callback) => {
    $.ajax({
      url: url + 'users/' + userID,
      type: 'GET',
      success: (user) => {
        callback(user);
      }
    });
  };

  const stringFromDate = (date) => {
    let day = date.getDate();
    const dayDigit = day % 10;
    const suffix =
      daySuffix[dayDigit - 1] !== undefined ? daySuffix[dayDigit - 1] : 'th';

    day = day + suffix;
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  $(document).on('click', 'span.show-reviews', function () {
    if (!$(this).data('clicked')) {
      const placeID = $(this).parents('article').attr('id');
      $(this).text('Hide');
      $.ajax({
        url: url + 'places/' + placeID + '/reviews/',
        type: 'GET',
        success: (reviews) => {
          for (const review of reviews) {
            const date = stringFromDate(new Date(review.created_at));
            $(`#${placeID} .reviews ul`).append(`\
              <li>\
                <h3>From <b id="${review.user_id}"></b> the ${date}</h3>\
                <p>${review.text}</p>\
              </li>\
            `);
            searchUser(review.user_id, (user) => {
              $(`b#${user.id}`).text(user.first_name);
            });
          }
        }
      });
      $(this).data('clicked', true);
    } else {
      $(this).text('Show');
      $(this).parents('.reviews').find('ul').empty();
      $(this).data('clicked', false);
    }
  });

  $('#search').click(() => {
    const filters = {
      states: Object.keys(statesSelect),
      cities: Object.keys(citiesSelect),
      amenities: Object.keys(amenitiesSelect)
    };
    searchPlaces(filters);
  });

  searchPlaces();
});
