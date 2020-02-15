import React, { Component } from 'react';
import { render } from 'react-dom';
import glamorous, { Div } from 'glamorous';
import { css } from 'glamor';
import matchSorter from 'match-sorter';
import starWarsNames from 'starwars-names';
import Downshift from 'downshift';
import {
  Menu,
  ControllerButton,
  Input,
  Item,
  ArrowIcon,
  XIcon
} from './components';

function ExampleDownshift({ itemToString, items, ...rest }) {
  return (
    <Downshift itemToString={itemToString} {...rest}>
      {({
        getInputProps,
        getToggleButtonProps,
        getItemProps,
        isOpen,
        toggleMenu,
        clearSelection,
        selectedItem,
        inputValue,
        highlightedIndex
      }) => (
        <div className={css({ width: 250, margin: 'auto' })}>
          <Div position="relative" css={{ paddingRight: '1.75em' }}>
            <Input
              {...getInputProps({
                isOpen,
                placeholder: 'Find a Star Wars character'
              })}
            />
            {selectedItem ? (
              <ControllerButton
                css={{ paddingTop: 4 }}
                onClick={clearSelection}
                aria-label="clear selection"
              >
                <XIcon />
              </ControllerButton>
            ) : (
              <ControllerButton {...getToggleButtonProps()}>
                <ArrowIcon isOpen={isOpen} />
              </ControllerButton>
            )}
          </Div>
          {!isOpen ? null : (
            <Menu>
              {items.map((item, index) => (
                <Item
                  key={item.id}
                  {...getItemProps({
                    item,
                    index,
                    isActive: highlightedIndex === index,
                    isSelected: selectedItem === item
                  })}
                >
                  {itemToString(item)}
                </Item>
              ))}
            </Menu>
          )}
        </div>
      )}
    </Downshift>
  );
}

class App extends React.Component {
  items = starWarsNames.all.map((s) => ({ name: s, id: s.toLowerCase() }));
  state = { isOpen: false, itemsToShow: [] };
  handleStateChange = (changes, downshiftState) => {
    if (changes.hasOwnProperty('isOpen')) {
      // downshift is saying that isOpen should change, so let's change it...
      this.setState(({ isOpen, itemsToShow }) => {
        // if it's changing because the user's clicking outside of the downshift
        // component, then we actually don't want to change the isOpen state
        isOpen =
          changes.type === Downshift.stateChangeTypes.mouseUp
            ? isOpen
            : changes.isOpen;
        if (isOpen) {
          // if the menu is going to be open, then we should limit the results
          // by what the user has typed in, otherwise, we'll leave them as they
          // were last...
          itemsToShow = this.getItemsToShow(downshiftState.inputValue);
        }
        return { isOpen, itemsToShow };
      });
    } else if (changes.hasOwnProperty('inputValue')) {
      // downshift is saying that the inputValue is changing. Since we don't
      // control that, we'll just use that information to update the items
      // that we should show.
      this.setState({
        itemsToShow: this.getItemsToShow(downshiftState.inputValue)
      });
    }
  };
  handleChange = (selectedItem, downshiftState) => {
    // handle the new selectedItem here
  };
  handleToggleButtonClick = () => {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen,
      itemsToShow: this.items
    }));
  };
  getItemsToShow(value) {
    return value
      ? matchSorter(this.items, value, {
          keys: ['name']
        })
      : this.items;
  }
  itemToString(i) {
    return i ? i.name : '';
  }
  render() {
    const { isOpen, itemsToShow } = this.state;
    return (
      <Div
        css={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center'
        }}
      >
        <h2>controlling isOpen</h2>
        <Div margin="20px auto" display="flex" flexDirection="column">
          <button onClick={this.handleToggleButtonClick}>Toggle isOpen</button>
          <strong>The menu is {isOpen ? 'open' : 'closed'}</strong>
        </Div>
        <ExampleDownshift
          onStateChange={this.handleStateChange}
          isOpen={isOpen}
          onChange={this.handleChange}
          items={itemsToShow}
          itemToString={this.itemToString}
        />
      </Div>
    );
  }
}

render(<App />, document.getElementById('root'));
