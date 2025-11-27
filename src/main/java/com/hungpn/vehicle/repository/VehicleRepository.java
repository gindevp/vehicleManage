package com.hungpn.vehicle.repository;

import com.hungpn.vehicle.domain.Vehicle;
import com.hungpn.vehicle.service.dto.PageResponse;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data R2DBC repository for the Vehicle entity.
 */
@SuppressWarnings("unused")
@Repository
public interface VehicleRepository extends ReactiveCrudRepository<Vehicle, Long>, VehicleRepositoryInternal {
    Flux<Vehicle> findAllBy(Pageable pageable);

    @Override
    <S extends Vehicle> Mono<S> save(S entity);

    @Override
    Flux<Vehicle> findAll();

    @Override
    Mono<Vehicle> findById(Long id);

    @Override
    Mono<Void> deleteById(Long id);

    @Override
    Mono<PageResponse<Vehicle>> search(String name, Long type, int page, int size);

}

 interface VehicleRepositoryInternal {

    Mono<PageResponse<Vehicle>> search(String name, Long type, int page, int size);

    <S extends Vehicle> Mono<S> save(S entity);

    Flux<Vehicle> findAllBy(Pageable pageable);

    Flux<Vehicle> findAll();

    Mono<Vehicle> findById(Long id);
    // this is not supported at the moment because of https://github.com/jhipster/generator-jhipster/issues/18269
    // Flux<Vehicle> findAllBy(Pageable pageable, Criteria criteria);
}
