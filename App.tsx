import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity,View } from 'react-native';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import * as R from 'ramda';

import amplify from './aws-exports';
import { createTodo } from './src/graphql/mutations';
import { listTodos } from './src/graphql/queries';

Amplify.configure(amplify);

const getTodos = async () => await API.graphql(graphqlOperation(listTodos));

const App = () => {
  const [name, setName] = useState('');
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const todos = getTodos();
    const saveTodos = R.pathOr([], ['data', 'listTodos', 'items'], todos);
    setTodos(saveTodos);
  }, []);

  const onChangeText = (value) => setName(value);

  const addTodo = async event => {

    event.preventDefault();

    const input = { name };
    const result = await API.graphql(graphqlOperation(createTodo, { input }));
    const newTodo = result.data.createTodo;
    const updatedTodo = [newTodo, ...todos];

    setName('');
    setTodos(updatedTodo);
  };

  const mapIndexed = R.addIndex(R.map);

  const renderTodo = (todo, key) => (
    <View key={key} style={styles.todo}>
      <Text style={styles.name}>{todo.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={value => onChangeText(value)}
        placeholder="Add a todo"
        style={styles.input}
        value={name}
      />
      <TouchableOpacity onPress={addTodo} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Add +</Text>
      </TouchableOpacity>
      {mapIndexed(renderTodo, todos)}
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  buttonContainer: {
		alignItems: "center",
		backgroundColor: "#34495e",
		borderRadius: 5,
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
  },
  buttonText: {
		color: "#fff",
		fontSize: 24
	},
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  input: {
		borderBottomColor: "blue",
		borderBottomWidth: 2,
		height: 50,
    marginVertical: 10,
    width: '90%'
  },
  name: { fontSize: 16 },
  todo: {
		borderBottomColor: "#ddd",
		borderBottomWidth: 1,
		paddingVertical: 10
	},
});
