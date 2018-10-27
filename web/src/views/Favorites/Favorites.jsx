import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Icon, { colors } from 'components/Icon.jsx';

import './Favorites.css';

@inject('storeFavorites')
@observer
export default class Favorites extends Component {
	
	// Update favorites afer reorder.
	reorder = (result) => {
		
		if (!result.destination) return;
		
		const favorites = [ ...this.props.storeFavorites.favorites ];
		favorites.splice(result.destination.index, 0, favorites.splice(result.source.index, 1)[0]);
		this.props.storeFavorites.favorites = favorites;
		
	}
	
	render() {
		
		const favorites = this.props.storeFavorites.favorites;
		
		return (
			<DragDropContext onDragEnd={this.reorder}>
				<Droppable droppableId="favorites">
					{(provided, snapshot) => (
						<main id="favorites" className="view" ref={provided.innerRef}>
							{favorites.length ? favorites.map((favorite, i) => (
								<Draggable draggableId={`favorites-${favorite.id}`} index={i} key={favorite.id}>
									{(provided, snapshot) => (
										<div className="favorites-stop-container" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
											<Link className="favorites-stop" style={{ backgroundColor: colors[favorite.type][0] }} to={`/stop?id=${favorite.id}`}>
												<Icon className="favorites-stop-icon" shape="stop" type={favorite.type} />
												<div>
													<div className="favorites-stop-name">{favorite.name}</div>
													<div className="favorites-stop-direction">{favorite.direction}</div>
												</div>
											</Link>
										</div>
									)}
								</Draggable>
							)) : (
								<div className="view-empty">
									No favorites added
								</div>
							)}
							{provided.placeholder}
						</main>
					)}
				</Droppable>
			</DragDropContext>
		);
		
	}
	
};
