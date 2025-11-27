package com.hungpn.vehicle.service;

import com.hungpn.vehicle.domain.Vehicle;
import com.hungpn.vehicle.repository.VehicleRepository;
import com.hungpn.vehicle.repository.VehicleRepositoryInternalImpl;
import com.hungpn.vehicle.service.dto.PageResponse;
import com.hungpn.vehicle.service.dto.VehicleDTO;
import com.hungpn.vehicle.service.mapper.VehicleMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.hungpn.vehicle.domain.Vehicle}.
 */
@Service
@Transactional
public class VehicleService {

    private static final Logger LOG = LoggerFactory.getLogger(VehicleService.class);

    private final VehicleRepository vehicleRepository;


    private final VehicleMapper vehicleMapper;

    public VehicleService(VehicleRepository vehicleRepository, VehicleMapper vehicleMapper) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleMapper = vehicleMapper;
    }

    /**
     * Save a vehicle.
     *
     * @param vehicleDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<VehicleDTO> save(VehicleDTO vehicleDTO) {
        LOG.debug("Request to save Vehicle : {}", vehicleDTO);
        return vehicleRepository.save(vehicleMapper.toEntity(vehicleDTO)).map(vehicleMapper::toDto);
    }

    /**
     * Update a vehicle.
     *
     * @param vehicleDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<VehicleDTO> update(VehicleDTO vehicleDTO) {
        LOG.debug("Request to update Vehicle : {}", vehicleDTO);
        return vehicleRepository.save(vehicleMapper.toEntity(vehicleDTO)).map(vehicleMapper::toDto);
    }

    /**
     * Partially update a vehicle.
     *
     * @param vehicleDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<VehicleDTO> partialUpdate(VehicleDTO vehicleDTO) {
        LOG.debug("Request to partially update Vehicle : {}", vehicleDTO);

        return vehicleRepository
            .findById(vehicleDTO.getId())
            .map(existingVehicle -> {
                vehicleMapper.partialUpdate(existingVehicle, vehicleDTO);

                return existingVehicle;
            })
            .flatMap(vehicleRepository::save)
            .map(vehicleMapper::toDto);
    }

    /**
     * Get all the vehicles.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Flux<VehicleDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Vehicles");
        return vehicleRepository.findAllBy(pageable).map(vehicleMapper::toDto);
    }
    /**
     * Get all the vehicles.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
//    @Transactional(readOnly = true)
//    public Page<VehicleDTO> search(VehicleDTO vehicleDTO, Pageable pageable) {
//        LOG.debug("Request to get all Vehicles");
//        return vehicleRepository.search(vehicleDTO.getName(), vehicleDTO.getType(), pageable).map(vehicleMapper::toDto);
//    }
    public Mono<PageResponse<Vehicle>> search(String name, Long type, int page, int size) {
        return vehicleRepository.search(
            (name == null || name.isBlank()) ? null : name,
            type,
            page, size
        );
    }

    /**
     * Returns the number of vehicles available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return vehicleRepository.count();
    }

    /**
     * Get one vehicle by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Mono<VehicleDTO> findOne(Long id) {
        LOG.debug("Request to get Vehicle : {}", id);
        return vehicleRepository.findById(id).map(vehicleMapper::toDto);
    }

    /**
     * Delete the vehicle by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(Long id) {
        LOG.debug("Request to delete Vehicle : {}", id);
        return vehicleRepository.deleteById(id);
    }
}
