export default function ProfilePage() {
	return (
		<div className="space-y-4">
			<header className="rounded-xl bg-white p-4 shadow-sm">
				<h1 className="text-base font-semibold text-gray-900">我的</h1>
				<p className="mt-1 text-xs text-gray-500">校园吃货Lv.3</p>
			</header>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<p className="text-sm font-semibold text-gray-900">美食足迹</p>
				<p className="mt-2 text-xs text-gray-500">已探索 8/20 家</p>
				<div className="mt-3 h-2 rounded-full bg-gray-100">
					<div className="h-2 w-2/5 rounded-full bg-brand-yellow" />
				</div>
			</section>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<ul className="space-y-3 text-sm text-gray-700">
					<li>口味偏好设置</li>
					<li>我的收藏（想吃 / 吃过 / 避雷）</li>
					<li>美食足迹地图</li>
				</ul>
			</section>
		</div>
	);
}
