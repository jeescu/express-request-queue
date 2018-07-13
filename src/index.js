'use strict';

/**
 * Queue
 */

class Queue {
	constructor() {
		this.fn = null;
		this.stacks = [];
	}

	/**
	 * @method _sync
	 * @description wraps callable request
	 * and added to the single stack
	 * 
	 * @param {Function} fn, xp request function
	 */

	sync = (fn) => {
		this.fn = fn;

		return (req, res, next) => {
			this.push({ req, res, next });
			this.emit();
		}
	}

	/**
	 * @method setFn
	 * @description set req callback for this queue
	 */

	setFn = (fn) => {
		this.fn = fn;
	}

	/**
	 * @method push
	 * @description adds request to the stack
	 * 
	 * @param {*} http, xp req, res and next objects
	 */

	push = (http) => {
		this.stacks.push({ http });
	}

	/**
	 * @method emit
	 * @description emits worker method '_emitSync'
	 */

	emit = () => {
		if (this.stacks.length == 1) {
			this._emitSync();
		}
	}

	/**
	 * @method _emitSync
	 * @description calls the next queued request
	 */

	_emitSync = async () => {
		const queuedRequest = this.stacks[0];

		if (queuedRequest) {
			const { req, res, next } = queuedRequest['http'];

			await this.fn(req, res, next);

			this.stacks.shift();
			this._emitSync();
		}
	}
}

/**
 * Request Queue
 */
class RequestQueue {
	constructor(config) {
		this.queues = {};
		this.config = config;
	}
	
	run = (fn) => {
		if (this.config) {
			// unique queue
			if (this.config.unique) {
				if (!this.config.from || !this.config.name) {
					throw new Error('Additional config elements are required: from, to');
				}

				return this._groupRun(fn);
			}
		
		} else {
			// normal queue
			return new Queue().sync(fn);
		}
	}

	_groupRun = (fn) => {
		return (req, res, next) => {
			const id = req[this.config.from][this.config.name];

			if (this.queues[id]) {
				this.queues[id].push({ req, res, next });
				this.queues[id].emit();
			} else {
				this.queues[id] = new Queue();
				this.queues[id].setFn(fn);
				this.queues[id].push({ req, res, next });
				this.queues[id].emit();
			}
		}
	}
}

module.exports = RequestQueue;