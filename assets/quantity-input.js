if (!customElements.get('quantity-input')) {
  customElements.define(
    'quantity-input',
    class QuantityInput extends HTMLElement {
      constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeEvent = new Event('change', { bubbles: true });

        this.querySelectorAll('button').forEach((button) =>
          button.addEventListener('click', this.onButtonClick.bind(this))
        );
      }

      onButtonClick(event) {
        event.preventDefault();
        const previousValue = this.input.value;

        if (event.target.name === 'plus') {
          if (
            parseInt(this.input.dataset.min) > 0 &&
            parseInt(this.input.value) === parseInt(this.input.dataset.min)
          ) {
            this.input.value = parseInt(this.input.dataset.min) + parseInt(this.input.step);
          } else {
            const result = this.input.value + parseInt(this.input.step);
            const max = this.input.getAttribute('max');

            if (max && result > parseInt(max)) {
              this.input.value = max;
            } else {
              this.input.value = result;
            }
          }
        } else {
          const result = this.input.value - parseInt(this.input.step);
          const min = this.input.getAttribute('min');

          if (min && result < parseInt(min)) {
            this.input.value = min;
          } else if (result < 0) {
            this.input.value = 0;
          } else {
            this.input.value = result;
          }
        }

        if (previousValue !== this.input.value) {
          this.input.dispatchEvent(this.changeEvent);
        }
      }
    }
  );
}
