'use strict';

/**
 * Queue
 */
class SyncMiddleware {
	constructor(config) {
		this.config = config;
		this.stacks = [];
	}
	
	/**
	 * @method _async
	 * @description wraps callable request
	 * and added to the stack
	 * 
	 * @param {Function} fn, xp request function
	 */
	sync = (fn) => {
		return (req, res, next) => {
			this.stacks.push({
				fn,
				http: { req, res, next }
			});

			if (this.stacks.length == 1) {
				this._emitSync();
			}
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
			const requestCall = queuedRequest['fn'];
	
			await requestCall(req, res, next);
	
			this.stacks.shift();
			this._emitSync();
		}
	}
}

export default SyncMiddleware;