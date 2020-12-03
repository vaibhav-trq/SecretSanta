const { Mustache } = window;

export const SwapContent = (src: String, data?: Object) => {
  RenderTemplate(`${src}-content`, '#content', data);
  RenderTemplate(`${src}-menu-buttons`, '#menu-buttons');
};

export const RenderTemplate = (src: String, dst: String, data?: Object) => {
  const template = $(`template#${src}`).html();
  const rendered = Mustache.render(template, data);
  $(dst).html(rendered);
};

export const AppendTemplate = (src: String, dst: String, data?: Object) => {
  const template = $(`template#${src}`).html();
  const rendered = Mustache.render(template, data);
  $(dst).append(rendered);
};

interface IException {
  code: string,
  message: string
};

function isException(obj: any): obj is IException {
  return obj && obj.code && obj.message;
}

export const GetErrorMessage = (e: any): string => {
  console.error(e);
  if (isException(e)) {
    if (e.code === "auth/invalid-verification-code") {
      return "Invalid verification code.";
    }
    if (e.code === "auth/invalid-phone-number") {
      return "Invalide phone number.";
    }
    return e.message;
  }
  return 'Unexepected error!';
};

export const AddMessage = (element: JQuery<HTMLElement>, message: string, success: boolean = false) => {
  const msg = $(`<h5><small class="font-weight-bold">${message}</small></h5>`);
  msg.addClass(success ? 'text-success' : 'text-danger');
  msg.insertAfter(element.parent()).delay(success ? 1000 : 5000).queue(() => msg.remove());
}

export const HumanReadableDate = (comparisonDate: string): String => {
  const today = new Date();
  const d = new Date(parseInt(comparisonDate));

  // Make a fuzzy time
  const delta = Math.round((today.getTime() - d.getTime()) / 1000);

  const minute = 60,
    hour = minute * 60,
    day = hour * 24;

  let fuzzy;

  if (delta < 30) {
    fuzzy = 'seconds ago';
  } else if (delta < minute) {
    fuzzy = delta + ' seconds ago';
  } else if (delta < 2 * minute) {
    fuzzy = 'a minute ago'
  } else if (delta < hour) {
    fuzzy = Math.floor(delta / minute) + ' minutes ago';
  } else if (Math.floor(delta / hour) == 1) {
    fuzzy = '1 hour ago'
  } else if (delta < day) {
    fuzzy = Math.floor(delta / hour) + ' hours ago';
  } else if (delta < day * 2) {
    fuzzy = 'yesterday';
  } else {
    fuzzy = Math.floor(delta / day) + ' days ago';
  }

  return fuzzy;
}
