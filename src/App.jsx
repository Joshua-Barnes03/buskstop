import React, { useState, useEffect } from 'react';
import {Route, HashRouter as Router, Switch, Link} from 'react-router-dom';
import MapView from './Map/MapView.jsx'
import Header from './Shared/Header.jsx';
import Footer from './Shared/Footer.jsx';
import Search from './Search/Search.jsx';
import Performer from './Performer/Performer.jsx';

const App = () => (
    <div className="h-screen grid grid-flow-col">
     <Performer />
    </div>
);

export default App;


// <Router>
// <Switch>
//   <Route exact path="/audience/:id">
//     {/* filler */}
//   </Route>
//   <Route exact path="/login">
//     {/* filler */}
//   </Route>
//   <Route exact path="/map">
//     <MapView />
//   </Route>
//   <Route exact path="/performer/:id">
//     {<Performer />}
//   </Route>
//   <Route exact path="/search">
//     <Search />
//   </Route>
// </Switch>
// </Router>
// <Footer menu={true}/>