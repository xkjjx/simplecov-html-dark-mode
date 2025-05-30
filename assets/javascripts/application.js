//= require_directory ./libraries/
//= require_directory ./plugins/
//= require_self

var isLightTheme = true;

document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('dark-mode-toggle');
  
  // Check if there's a saved preference in localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    isLightTheme = false;
    document.body.classList.add('dark-mode');
    button.textContent = 'Light Mode';
  } else {
    button.textContent = 'Dark Mode';
  }
  
  button.addEventListener('click', function() {
    isLightTheme = !isLightTheme;
    
    // Toggle dark mode class on body
    if (isLightTheme) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
      button.textContent = 'Dark Mode';
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
      button.textContent = 'Light Mode';
    }
  });
});

$(document).ready(function () {
  $('.file_list').dataTable({
    order: [[1, "asc"]],
    paging: false
  });

  // Syntax highlight all files up front - deactivated
  // $('.source_table pre code').each(function(i, e) {hljs.highlightBlock(e, '  ')});

  // Syntax highlight source files on first toggle of the file view popup
  $("a.src_link").click(function () {
    // Get the source file element that corresponds to the clicked element
    var source_table = $($(this).attr('href'));

    // If not highlighted yet, do it!
    if (!source_table.hasClass('highlighted')) {
      source_table.find('pre code').each(function (i, e) { hljs.highlightBlock(e, '  ') });
      source_table.addClass('highlighted');
    };
  });

  var prev_anchor;
  var curr_anchor;

  // Set-up of popup for source file views
  $("a.src_link").colorbox({
    transition: "none",
    inline: true,
    opacity: 1,
    width: "95%",
    height: "95%",
    onLoad: function () {
      prev_anchor = curr_anchor ? curr_anchor : window.location.hash.substring(1);
      curr_anchor = this.href.split('#')[1];
      window.location.hash = curr_anchor;

      $('.file_list_container').hide();
    },
    onCleanup: function () {
      if (prev_anchor && prev_anchor != curr_anchor) {
        $('a[href="#' + prev_anchor + '"]').click();
        curr_anchor = prev_anchor;
      } else {
        $('.group_tabs a:first').click();
        prev_anchor = curr_anchor;
        curr_anchor = "#_AllFiles";
      }
      window.location.hash = curr_anchor;

      var active_group = $('.group_tabs li.active a').attr('class');
      $("#" + active_group + ".file_list_container").show();
    }
  });

  // Set-up of anchor of linenumber
  $('.source_table li[data-linenumber]').click(function () {
    $('#cboxLoadedContent').scrollTop(this.offsetTop);
    var new_anchor = curr_anchor.replace(/-.*/, '') + '-L' + $(this).data('linenumber');
    window.location.replace(window.location.href.replace(/#.*/, '#' + new_anchor));
    curr_anchor = new_anchor;
    return false;
  });

  window.onpopstate = function (event) {
    if (window.location.hash.substring(0, 2) == "#_") {
      $.colorbox.close();
      curr_anchor = window.location.hash.substring(1);
    } else {
      if ($('#colorbox').is(':hidden')) {
        var anchor = window.location.hash.substring(1);
        var ary = anchor.split('-L');
        var source_file_id = ary[0];
        var linenumber = ary[1];
        $('a.src_link[href="#' + source_file_id + '"]').colorbox({ open: true });
        if (linenumber !== undefined) {
          $('#cboxLoadedContent').scrollTop($('#cboxLoadedContent .source_table li[data-linenumber="' + linenumber + '"]')[0].offsetTop);
        }
      }
    }
  };

  // Hide src files and file list container after load
  $('.source_files').hide();
  $('.file_list_container').hide();

  // Add tabs based upon existing file_list_containers
  $('.file_list_container h2').each(function () {
    var container_id = $(this).parent().attr('id');
    var group_name = $(this).find('.group_name').first().html();
    var covered_percent = $(this).find('.covered_percent').first().html();

    $('.group_tabs').append('<li><a href="#' + container_id + '">' + group_name + ' (' + covered_percent + ')</a></li>');
  });

  $('.group_tabs a').each(function () {
    $(this).addClass($(this).attr('href').replace('#', ''));
  });

  // Make sure tabs don't get ugly focus borders when active
  $('.group_tabs').on('focus', 'a', function () { $(this).blur(); });

  var favicon_path = $('link[rel="icon"]').attr('href');
  $('.group_tabs').on('click', 'a', function () {
    if (!$(this).parent().hasClass('active')) {
      $('.group_tabs a').parent().removeClass('active');
      $(this).parent().addClass('active');
      $('.file_list_container').hide();
      $(".file_list_container" + $(this).attr('href')).show();
      window.location.href = window.location.href.split('#')[0] + $(this).attr('href').replace('#', '#_');

      // Force favicon reload - otherwise the location change containing anchor would drop the favicon...
      // Works only on firefox, but still... - Anyone know a better solution to force favicon on local file?
      $('link[rel="icon"]').remove();
      $('head').append('<link rel="icon" type="image/png" href="' + favicon_path + '" />');
    };
    return false;
  });

  if (window.location.hash) {
    var anchor = window.location.hash.substring(1);
    if (anchor.length === 40) {
      $('a.src_link[href="#' + anchor + '"]').click();
    } else if (anchor.length > 40) {
      var ary = anchor.split('-L');
      var source_file_id = ary[0];
      var linenumber = ary[1];
      $('a.src_link[href="#' + source_file_id + '"]').colorbox({ open: true });
      // Scroll to anchor of linenumber
      $('#' + source_file_id + ' li[data-linenumber="' + linenumber + '"]').click();
    } else {
      $('.group_tabs a.' + anchor.replace('_', '')).click();
    }
  } else {
    $('.group_tabs a:first').click();
  };

  $("abbr.timeago").timeago();
  $('#loading').fadeOut();
  $('#wrapper').show();
  $('.dataTables_filter input').focus()
});
